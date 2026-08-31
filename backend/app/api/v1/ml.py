from fastapi import APIRouter
from typing import List, Dict, Any, Optional

router = APIRouter()

RISKY_MINES = [
    {
        'id': 'M-101', 
        'name': 'Jharia Coal Block 4', 
        'state': 'Jharkhand',
        'type': 'Underground',
        'risk_score': 0.94, 
        'rank': 1, 
        'hazard_type': 'Methane Gas Concentration',
        'last_inspected': '2026-08-12',
        'active_workforce': 420,
        'methane_level': '1.8%',
        'dgms_zone': 'Eastern Zone',
        'description': 'High methane concentration detected in Seam 4 gallery. Requires immediate DGMS DG-102 statutory ventilation audit.'
    },
    {
        'id': 'M-102', 
        'name': 'Raniganj Deep Shaft Seam 7', 
        'state': 'West Bengal',
        'type': 'Underground',
        'risk_score': 0.88, 
        'rank': 2, 
        'hazard_type': 'Roof / Strata Instability',
        'last_inspected': '2026-08-05',
        'active_workforce': 310,
        'methane_level': '0.6%',
        'dgms_zone': 'Eastern Zone',
        'description': 'Strata movement and telltale indicators showing convergence exceeding 12mm at junction 4.'
    },
    {
        'id': 'M-103', 
        'name': 'Singrauli Open Cast Pit 2', 
        'state': 'Madhya Pradesh',
        'type': 'Open Cast',
        'risk_score': 0.82, 
        'rank': 3, 
        'hazard_type': 'Haul Road Slope Failure',
        'last_inspected': '2026-07-28',
        'active_workforce': 580,
        'methane_level': 'N/A',
        'dgms_zone': 'Central Zone',
        'description': 'Bench slope angle in overburden dump #3 exceeds permissible DGMS limits following heavy monsoon.'
    },
    {
        'id': 'M-104', 
        'name': 'Korba Underground Section B', 
        'state': 'Chhattisgarh',
        'type': 'Underground',
        'risk_score': 0.79, 
        'rank': 4, 
        'hazard_type': 'Water Inundation Risk',
        'last_inspected': '2026-08-01',
        'active_workforce': 290,
        'methane_level': '0.4%',
        'dgms_zone': 'Central Zone',
        'description': 'Proximity to old waterlogged workings requires continuous advance boring and barrier verification.'
    },
    {
        'id': 'M-105', 
        'name': 'Talcher Colliery Pit 2', 
        'state': 'Odisha',
        'type': 'Open Cast / UG',
        'risk_score': 0.75, 
        'rank': 5, 
        'hazard_type': 'Coal Dust Explosion Hazard',
        'last_inspected': '2026-08-10',
        'active_workforce': 460,
        'methane_level': '0.5%',
        'dgms_zone': 'South Eastern Zone',
        'description': 'Inadequate stone dusting in conveyor roadway #1. Combustible dust ratio below compliance.'
    },
    {
        'id': 'M-106', 
        'name': 'Godavari Valley Seam 3', 
        'state': 'Telangana',
        'type': 'Underground',
        'risk_score': 0.72, 
        'rank': 6, 
        'hazard_type': 'High Ambient Temperature / Fire',
        'last_inspected': '2026-07-15',
        'active_workforce': 380,
        'methane_level': '0.8%',
        'dgms_zone': 'Southern Zone',
        'description': 'Spontaneous heating symptoms near sealed off area Panel 12.'
    },
    {
        'id': 'M-107', 
        'name': 'Bokaro Open Pit Mine 1', 
        'state': 'Jharkhand',
        'type': 'Open Cast',
        'risk_score': 0.69, 
        'rank': 7, 
        'hazard_type': 'Heavy Dump Slope Instability',
        'last_inspected': '2026-08-14',
        'active_workforce': 610,
        'methane_level': 'N/A',
        'dgms_zone': 'Eastern Zone',
        'description': 'Heavy machinery operating within 10m of crest without adequate berm safety barriers.'
    },
    {
        'id': 'M-108', 
        'name': 'Wardha Valley Underground', 
        'state': 'Maharashtra',
        'type': 'Underground',
        'risk_score': 0.67, 
        'rank': 8, 
        'hazard_type': 'Toxic Gas & Poor Air Velocity',
        'last_inspected': '2026-07-22',
        'active_workforce': 270,
        'methane_level': '0.9%',
        'dgms_zone': 'Western Zone',
        'description': 'Auxiliary fan velocity dropped below 0.5 m/s at development heading.'
    },
    {
        'id': 'M-109', 
        'name': 'Ramagundam Deep Mining Pit', 
        'state': 'Telangana',
        'type': 'Underground',
        'risk_score': 0.64, 
        'rank': 9, 
        'hazard_type': 'Roof Bolt Anchorage Failure',
        'last_inspected': '2026-08-02',
        'active_workforce': 340,
        'methane_level': '0.3%',
        'dgms_zone': 'Southern Zone',
        'description': 'Resin capsule anchorage test failed on 3 consecutive roof bolts in main intake.'
    },
    {
        'id': 'M-110', 
        'name': 'Kothagudem Incline 5', 
        'state': 'Telangana',
        'type': 'Underground',
        'risk_score': 0.61, 
        'rank': 10, 
        'hazard_type': 'Conveyor Belt Friction Spark',
        'last_inspected': '2026-07-30',
        'active_workforce': 220,
        'methane_level': '0.5%',
        'dgms_zone': 'Southern Zone',
        'description': 'Sequence control and thermal sensor relay bypassed on trunk conveyor belt.'
    },
    {
        'id': 'M-111', 
        'name': 'Sohagpur Shaft 4', 
        'state': 'Madhya Pradesh',
        'type': 'Underground',
        'risk_score': 0.58, 
        'rank': 11, 
        'hazard_type': 'Underground Substation Fault',
        'last_inspected': '2026-08-08',
        'active_workforce': 190,
        'methane_level': '0.2%',
        'dgms_zone': 'Central Zone',
        'description': 'Earth leakage relay trip delay exceeded statutory maximum.'
    },
    {
        'id': 'M-112', 
        'name': 'Ib Valley Open Cut', 
        'state': 'Odisha',
        'type': 'Open Cast',
        'risk_score': 0.55, 
        'rank': 12, 
        'hazard_type': 'Blasting Flyrock Hazard',
        'last_inspected': '2026-08-11',
        'active_workforce': 520,
        'methane_level': 'N/A',
        'dgms_zone': 'South Eastern Zone',
        'description': 'Blast cordon radius was insufficiently marked on Western boundary.'
    },
    {
        'id': 'M-113', 
        'name': 'Karanpura Seam South', 
        'state': 'Jharkhand',
        'type': 'Underground',
        'risk_score': 0.52, 
        'rank': 13, 
        'hazard_type': 'Auxiliary Fan Ventilation Loss',
        'last_inspected': '2026-07-20',
        'active_workforce': 310,
        'methane_level': '0.7%',
        'dgms_zone': 'Eastern Zone',
        'description': 'Air duct leakage index at 28% requiring immediate re-sleeving.'
    },
    {
        'id': 'M-114', 
        'name': 'Chirimiri Gallery Section', 
        'state': 'Chhattisgarh',
        'type': 'Underground',
        'risk_score': 0.49, 
        'rank': 14, 
        'hazard_type': 'Side Spalling & Water Leakage',
        'last_inspected': '2026-08-04',
        'active_workforce': 260,
        'methane_level': '0.3%',
        'dgms_zone': 'Central Zone',
        'description': 'Pillar corners spalling along fault plane line in Seam 2.'
    },
    {
        'id': 'M-115', 
        'name': 'Pench Valley Pit 9', 
        'state': 'Madhya Pradesh',
        'type': 'Underground',
        'risk_score': 0.45, 
        'rank': 15, 
        'hazard_type': 'Haulage Rope Tension Fatigue',
        'last_inspected': '2026-07-25',
        'active_workforce': 180,
        'methane_level': '0.2%',
        'dgms_zone': 'Western Zone',
        'description': 'Direct haulage wire rope discarded wire count reached 4 in one lay.'
    }
]

@router.get('/rankings', response_model=List[Dict[str, Any]])
def get_ml_rankings(min_score: Optional[float] = 0.0, hazard: Optional[str] = None):
    results = [m for m in RISKY_MINES if m['risk_score'] >= min_score]
    if hazard:
        results = [m for m in results if hazard.lower() in m['hazard_type'].lower()]
    return results

@router.get('/mine/{mine_id}')
def get_mine_details(mine_id: str):
    for m in RISKY_MINES:
        if m['id'] == mine_id:
            return m
    return {'error': 'Mine not found'}

@router.get('/briefing')
def get_daily_safety_briefing():
    return {
        'shift': 'First Shift (Morning)',
        'weather_advisory': 'High humidity & thunderstorm warnings in Eastern & Central Coalfields.',
        'key_focus_areas': [
            'Continuous methane monitoring at all cutting faces in Jharia & Raniganj blocks.',
            'Verify haul road berm height is at least equal to tire diameter of largest dumper.',
            'Mandatory gas testing before switching on electrical apparatus.'
        ],
        'dgms_circular_ref': 'DGMS Circular (Legislation) No. 03 of 2026 - Hazard Identification & Risk Assessment'
    }
