# ============================================================
# COAL-MINE COMPLIANCE PDF DISCOVERY + SELECTIVE DOWNLOADER
# Google Colab - ONE CELL
# ============================================================

!pip -q install requests beautifulsoup4 pandas tqdm


# -----------------------------
# IMPORTS
# -----------------------------

import os
import re
import time
import hashlib
import shutil

from collections import deque, defaultdict
from datetime import datetime
from urllib.parse import (
    urljoin,
    urlparse,
    urldefrag,
    unquote
)

import requests
import pandas as pd

from bs4 import BeautifulSoup
from tqdm.auto import tqdm


# ============================================================
# CONFIGURATION
# ============================================================

INPUT_FILE = "/content/urls.txt"

OUTPUT_DIR = "/content/coal_pdf_scraper"

DISCOVERY_FILE = os.path.join(
    OUTPUT_DIR,
    "discovered_pdfs.csv"
)

DOWNLOAD_FILE = os.path.join(
    OUTPUT_DIR,
    "downloads.csv"
)

PDF_DIR = os.path.join(
    OUTPUT_DIR,
    "pdfs"
)

# IMPORTANT:
# Start with 50-100 while testing.
#
# This means maximum HTML pages visited PER DOMAIN.
MAX_PAGES_PER_DOMAIN = 100

# Delay between requests.
REQUEST_DELAY = 1.0

REQUEST_TIMEOUT = 30

# Relevance threshold for downloading.
#
# 0.80 = conservative
# 0.65 = recommended starting point
# 0.50 = higher recall / more downloads
DOWNLOAD_THRESHOLD = 0.65


# ============================================================
# CREATE DIRECTORIES
# ============================================================

os.makedirs(
    PDF_DIR,
    exist_ok=True
)


# ============================================================
# HTTP SESSION
# ============================================================

session = requests.Session()

session.headers.update({
    "User-Agent": (
        "Mozilla/5.0 "
        "(compatible; CoalComplianceResearch/1.0)"
    ),
    "Accept": (
        "text/html,"
        "application/xhtml+xml,"
        "application/pdf,"
        "*/*"
    )
})


# ============================================================
# URL HELPERS
# ============================================================

def normalize_url(url):

    url = url.strip()

    if not url:
        return None

    if url.startswith("#"):
        return None

    if not url.startswith(
        ("http://", "https://")
    ):
        url = "https://" + url

    url, _ = urldefrag(url)

    return url


def get_domain(url):

    domain = urlparse(
        url
    ).netloc.lower()

    if domain.startswith("www."):
        domain = domain[4:]

    return domain


def is_pdf_url(url):

    path = urlparse(
        url
    ).path.lower()

    return path.endswith(".pdf")


def is_http_url(url):

    return url.startswith(
        ("http://", "https://")
    )


# ============================================================
# RELEVANCE KEYWORDS
# ============================================================

# These are NOT a hard filter.
#
# They are only used to rank discovered PDFs.
#
# A PDF that scores LOW is still retained in
# discovered_pdfs.csv and can be reviewed later.

HIGH_VALUE = {

    "coal mine": 1.00,
    "coal mining": 1.00,
    "coal mines": 1.00,

    "coal mines regulation": 1.00,
    "coal mines regulations": 1.00,

    "mines act": 1.00,

    "mine safety": 1.00,

    "dgms": 1.00,

    "mining plan": 1.00,
    "mine closure": 1.00,

    "environmental clearance": 1.00,
    "environmental compliance": 1.00,

    "mineral conservation": 1.00,

    "illegal mining": 1.00,

    "contract labour": 0.90,
    "contractor compliance": 0.90,

    "occupational safety": 0.90,

    "statutory compliance": 1.00
}


MEDIUM_VALUE = {

    "mining": 0.50,
    "mine": 0.40,

    "compliance": 0.60,
    "inspection": 0.60,
    "safety": 0.60,

    "environment": 0.50,

    "labour": 0.50,
    "worker": 0.40,
    "contractor": 0.50,

    "monitoring": 0.50,

    "guidelines": 0.40,
    "regulation": 0.50,
    "notification": 0.50,
    "circular": 0.40,

    "statutory": 0.60,

    "report": 0.20,
    "production": 0.40,
    "closure": 0.50,

    "pollution": 0.50,
    "groundwater": 0.50,
    "effluent": 0.50
}


# ============================================================
# RELEVANCE SCORING
# ============================================================

def calculate_relevance(
    pdf_url,
    link_text="",
    page_title="",
    context=""
):

    combined = " ".join([
        pdf_url or "",
        link_text or "",
        page_title or "",
        context or ""
    ]).lower()

    combined = unquote(
        combined
    )

    score = 0.0

    high_hits = []
    medium_hits = []

    for keyword, weight in HIGH_VALUE.items():

        if keyword in combined:

            score += weight
            high_hits.append(
                keyword
            )

    for keyword, weight in MEDIUM_VALUE.items():

        if keyword in combined:

            score += weight
            medium_hits.append(
                keyword
            )

    # Normalize to 0-1
    score = min(
        1.0,
        score / 4.0
    )

    if score >= 0.80:

        classification = "HIGH"

    elif score >= 0.50:

        classification = "MEDIUM"

    else:

        classification = "LOW"

    return {

        "relevance_score":
            round(score, 3),

        "classification":
            classification,

        "high_keywords":
            ", ".join(high_hits),

        "medium_keywords":
            ", ".join(medium_hits)
    }


# ============================================================
# EXTRACT PDF LINKS FROM HTML
# ============================================================

def extract_page_information(
    html,
    page_url
):

    soup = BeautifulSoup(
        html,
        "html.parser"
    )

    if soup.title:

        page_title = soup.title.get_text(
            " ",
            strip=True
        )

    else:

        page_title = ""

    pdf_candidates = []

    html_pages = []

    current_domain = get_domain(
        page_url
    )

    for tag in soup.find_all(
        "a",
        href=True
    ):

        href = tag.get(
            "href"
        )

        if not href:
            continue

        href = href.strip()

        if href.startswith((
            "javascript:",
            "mailto:",
            "tel:",
            "#",
            "data:"
        )):

            continue

        absolute_url = urljoin(
            page_url,
            href
        )

        absolute_url, _ = urldefrag(
            absolute_url
        )

        if not is_http_url(
            absolute_url
        ):

            continue

        link_domain = get_domain(
            absolute_url
        )

        link_text = tag.get_text(
            " ",
            strip=True
        )

        parent_context = ""

        if tag.parent:

            parent_context = (
                tag.parent
                .get_text(
                    " ",
                    strip=True
                )
            )

        # -------------------------
        # PDF
        # -------------------------

        if is_pdf_url(
            absolute_url
        ):

            relevance = calculate_relevance(
                pdf_url=absolute_url,
                link_text=link_text,
                page_title=page_title,
                context=parent_context
            )

            candidate = {

                "pdf_url":
                    absolute_url,

                "source_page":
                    page_url,

                "domain":
                    link_domain,

                "link_text":
                    link_text,

                "page_title":
                    page_title,

                "context":
                    parent_context[:1000],

                **relevance,

                "discovered_at":
                    datetime.now().isoformat()
            }

            pdf_candidates.append(
                candidate
            )

        # -------------------------
        # HTML PAGE
        # -------------------------

        elif link_domain == current_domain:

            html_pages.append(
                absolute_url
            )

    return (
        pdf_candidates,
        html_pages
    )


# ============================================================
# CRAWL ONE DOMAIN
# ============================================================

def crawl_domain(
    domain,
    starting_urls
):

    queue = deque()

    for url in starting_urls:

        normalized = normalize_url(
            url
        )

        if normalized:

            queue.append(
                normalized
            )

    visited_pages = set()

    discovered_pdfs = {}

    pages_crawled = 0

    print()
    print("=" * 80)
    print("DOMAIN:", domain)
    print("=" * 80)

    while queue:

        current_url = queue.popleft()

        current_url = normalize_url(
            current_url
        )

        if not current_url:
            continue

        if current_url in visited_pages:
            continue

        if get_domain(
            current_url
        ) != domain:

            continue

        # Direct PDF URLs are handled
        # outside the crawler.
        if is_pdf_url(
            current_url
        ):

            continue

        if (
            MAX_PAGES_PER_DOMAIN
            and pages_crawled
            >= MAX_PAGES_PER_DOMAIN
        ):

            print(
                "Page limit reached:",
                MAX_PAGES_PER_DOMAIN
            )

            break

        visited_pages.add(
            current_url
        )

        pages_crawled += 1

        print(
            f"[{pages_crawled}] "
            f"{current_url}"
        )

        try:

            response = session.get(
                current_url,
                timeout=REQUEST_TIMEOUT,
                allow_redirects=True
            )

            response.raise_for_status()

            content_type = response.headers.get(
                "Content-Type",
                ""
            ).lower()

            # Only process HTML
            if "text/html" not in content_type:

                continue

            final_url = normalize_url(
                response.url
            )

            pdfs, html_pages = (
                extract_page_information(
                    response.text,
                    final_url
                )
            )

            # Save unique PDFs
            for candidate in pdfs:

                pdf_url = candidate[
                    "pdf_url"
                ]

                if pdf_url not in discovered_pdfs:

                    discovered_pdfs[
                        pdf_url
                    ] = candidate

            # Add more same-domain pages
            for page in html_pages:

                if page not in visited_pages:

                    queue.append(
                        page
                    )

        except Exception as error:

            print(
                "  ERROR:",
                str(error)[:250]
            )

        time.sleep(
            REQUEST_DELAY
        )

    print()
    print(
        "Pages crawled:",
        pages_crawled
    )

    print(
        "PDFs discovered:",
        len(discovered_pdfs)
    )

    return list(
        discovered_pdfs.values()
    )


# ============================================================
# LOAD URLS
# ============================================================

if not os.path.exists(
    INPUT_FILE
):

    raise FileNotFoundError(
        f"Could not find {INPUT_FILE}. "
        "Upload your urls.txt first."
    )


with open(
    INPUT_FILE,
    "r",
    encoding="utf-8"
) as file:

    raw_urls = []

    for line in file:

        line = line.strip()

        if not line:
            continue

        if line.startswith("#"):
            continue

        url = normalize_url(
            line
        )

        if url:

            raw_urls.append(
                url
            )


# Remove duplicate URLs
urls = list(
    dict.fromkeys(
        raw_urls
    )
)


# ============================================================
# GROUP BY DOMAIN
# ============================================================

domain_urls = defaultdict(list)

for url in urls:

    domain = get_domain(
        url
    )

    domain_urls[
        domain
    ].append(
        url
    )


print()
print("=" * 80)
print("INPUT SUMMARY")
print("=" * 80)

print(
    "Total URLs:",
    len(urls)
)

print(
    "Unique domains:",
    len(domain_urls)
)

print()

for domain, items in sorted(
    domain_urls.items()
):

    print(
        f"{domain:40s} "
        f"{len(items)} starting URLs"
    )


# ============================================================
# DISCOVER PDFs
# ============================================================

all_candidates = []

print()
print("=" * 80)
print("STARTING PDF DISCOVERY")
print("=" * 80)


for domain, starting_urls in sorted(
    domain_urls.items()
):

    # --------------------------------------------------------
    # DIRECT PDFs IN urls.txt
    # --------------------------------------------------------

    for url in starting_urls:

        if is_pdf_url(
            url
        ):

            relevance = calculate_relevance(
                pdf_url=url
            )

            all_candidates.append({

                "pdf_url":
                    url,

                "source_page":
                    url,

                "domain":
                    domain,

                "link_text":
                    "",

                "page_title":
                    "",

                "context":
                    "",

                **relevance,

                "discovered_at":
                    datetime.now().isoformat()
            })

    # --------------------------------------------------------
    # CRAWL HTML STARTING URLs
    # --------------------------------------------------------

    discovered = crawl_domain(
        domain,
        starting_urls
    )

    all_candidates.extend(
        discovered
    )


# ============================================================
# CREATE DISCOVERY DATAFRAME
# ============================================================

if all_candidates:

    discovered_df = pd.DataFrame(
        all_candidates
    )

    # One record per PDF URL
    discovered_df = (
        discovered_df
        .drop_duplicates(
            subset=["pdf_url"],
            keep="first"
        )
        .sort_values(
            "relevance_score",
            ascending=False
        )
        .reset_index(
            drop=True
        )
    )

else:

    discovered_df = pd.DataFrame(
        columns=[
            "pdf_url",
            "source_page",
            "domain",
            "link_text",
            "page_title",
            "context",
            "relevance_score",
            "classification",
            "high_keywords",
            "medium_keywords",
            "discovered_at"
        ]
    )


# ============================================================
# SAVE DISCOVERY CSV
# ============================================================

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)

discovered_df.to_csv(
    DISCOVERY_FILE,
    index=False,
    encoding="utf-8"
)


# ============================================================
# SHOW DISCOVERY RESULTS
# ============================================================

print()
print("=" * 80)
print("DISCOVERY COMPLETE")
print("=" * 80)

print(
    "Unique PDF candidates:",
    len(discovered_df)
)

if len(discovered_df):

    print(
        "\nHIGH:",
        (
            discovered_df[
                "classification"
            ] == "HIGH"
        ).sum()
    )

    print(
        "MEDIUM:",
        (
            discovered_df[
                "classification"
            ] == "MEDIUM"
        ).sum()
    )

    print(
        "LOW:",
        (
            discovered_df[
                "classification"
            ] == "LOW"
        ).sum()
    )

    print()
    print(
        "Top candidates:"
    )

    display(
        discovered_df[
            [
                "domain",
                "pdf_url",
                "link_text",
                "relevance_score",
                "classification",
                "high_keywords"
            ]
        ].head(50)
    )


print()
print(
    "Discovery CSV:"
)

print(
    DISCOVERY_FILE
)


# ============================================================
# SELECT PDFs TO DOWNLOAD
# ============================================================

download_candidates = (
    discovered_df[
        discovered_df[
            "relevance_score"
        ] >= DOWNLOAD_THRESHOLD
    ]
    .copy()
)


print()
print("=" * 80)
print("DOWNLOAD SELECTION")
print("=" * 80)

print(
    "Threshold:",
    DOWNLOAD_THRESHOLD
)

print(
    "Selected PDFs:",
    len(download_candidates)
)


if len(download_candidates):

    display(
        download_candidates[
            [
                "domain",
                "pdf_url",
                "relevance_score",
                "classification",
                "high_keywords"
            ]
        ].head(100)
    )


# ============================================================
# PDF FILENAME
# ============================================================

def create_filename(
    url
):

    parsed = urlparse(
        url
    )

    filename = os.path.basename(
        parsed.path
    )

    filename = unquote(
        filename
    )

    if not filename:

        filename = "document.pdf"

    if not filename.lower().endswith(
        ".pdf"
    ):

        filename += ".pdf"

    filename = re.sub(
        r"[^a-zA-Z0-9._()\- ]",
        "_",
        filename
    )

    name, extension = os.path.splitext(
        filename
    )

    # Prevent filename collisions
    url_hash = hashlib.sha256(
        url.encode(
            "utf-8"
        )
    ).hexdigest()[:10]

    return (
        f"{name}_{url_hash}"
        f"{extension}"
    )


# ============================================================
# DOWNLOAD PDF
# ============================================================

def download_pdf(
    row
):

    pdf_url = row[
        "pdf_url"
    ]

    domain = row[
        "domain"
    ]

    domain_folder = os.path.join(
        PDF_DIR,
        domain
    )

    os.makedirs(
        domain_folder,
        exist_ok=True
    )

    filename = create_filename(
        pdf_url
    )

    filepath = os.path.join(
        domain_folder,
        filename
    )

    # Already downloaded
    if os.path.exists(
        filepath
    ):

        return {

            **row.to_dict(),

            "download_status":
                "already_exists",

            "filepath":
                filepath
        }

    try:

        response = session.get(
            pdf_url,
            timeout=REQUEST_TIMEOUT,
            stream=True,
            allow_redirects=True
        )

        response.raise_for_status()

        content_type = (
            response.headers
            .get(
                "Content-Type",
                ""
            )
            .lower()
        )

        final_url = response.url

        final_path = urlparse(
            final_url
        ).path.lower()

        # Some government servers
        # incorrectly return application/octet-stream.
        #
        # Therefore accept:
        #   application/pdf
        # OR
        #   URL ending in .pdf
        if (
            "pdf" not in content_type
            and not final_path.endswith(".pdf")
        ):

            raise ValueError(
                f"Response does not appear "
                f"to be PDF: {content_type}"
            )

        total_size = 0

        with open(
            filepath,
            "wb"
        ) as file:

            for chunk in response.iter_content(
                chunk_size=64 * 1024
            ):

                if chunk:

                    file.write(
                        chunk
                    )

                    total_size += len(
                        chunk
                    )

        return {

            **row.to_dict(),

            "download_status":
                "downloaded",

            "filepath":
                filepath,

            "size_bytes":
                total_size
        }

    except Exception as error:

        return {

            **row.to_dict(),

            "download_status":
                f"error: {error}",

            "filepath":
                ""
        }


# ============================================================
# DOWNLOAD
# ============================================================

download_results = []

if len(download_candidates):

    for _, row in tqdm(
        download_candidates.iterrows(),
        total=len(download_candidates),
        desc="Downloading PDFs"
    ):

        result = download_pdf(
            row
        )

        download_results.append(
            result
        )

        time.sleep(
            REQUEST_DELAY
        )


# ============================================================
# SAVE DOWNLOAD RESULTS
# ============================================================

if download_results:

    downloads_df = pd.DataFrame(
        download_results
    )

else:

    downloads_df = pd.DataFrame()


downloads_df.to_csv(
    DOWNLOAD_FILE,
    index=False,
    encoding="utf-8"
)


# ============================================================
# FINAL SUMMARY
# ============================================================

print()
print("=" * 80)
print("SCRAPING COMPLETE")
print("=" * 80)

print(
    "Total starting URLs:",
    len(urls)
)

print(
    "Unique domains:",
    len(domain_urls)
)

print(
    "PDF candidates discovered:",
    len(discovered_df)
)

print(
    "PDFs selected for download:",
    len(download_candidates)
)

if len(downloads_df):

    downloaded_count = (
        downloads_df[
            "download_status"
        ] == "downloaded"
    ).sum()

    existing_count = (
        downloads_df[
            "download_status"
        ] == "already_exists"
    ).sum()

    error_count = (
        downloads_df[
            "download_status"
        ]
        .astype(str)
        .str.startswith("error")
        .sum()
    )

    print(
        "Successfully downloaded:",
        downloaded_count
    )

    print(
        "Already existed:",
        existing_count
    )

    print(
        "Errors:",
        error_count
    )


# ============================================================
# CREATE ZIP
# ============================================================

zip_path = shutil.make_archive(
    "/content/coal_compliance_pdfs",
    "zip",
    OUTPUT_DIR
)

print()
print(
    "Discovery CSV:"
)

print(
    DISCOVERY_FILE
)

print()
print(
    "Download CSV:"
)

print(
    DOWNLOAD_FILE
)

print()
print(
    "ZIP:"
)

print(
    zip_path
)