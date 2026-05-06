from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from backend.app.auth.dependencies import get_current_user, require_roles
from backend.app.auth.rbac import Role
from backend.app.models.user import User

router = APIRouter(prefix="/sport-complexes", tags=["sport-complexes"])

_sport_complexes: list[dict] = [
    {"id": "1", "name": "Arena Central", "address": "Rua das Quadras, 100", "city": "São Paulo"},
    {"id": "2", "name": "Complexo Norte", "address": "Av. do Esporte, 200", "city": "Campinas"},
]


class SportComplex(BaseModel):
    id: str
    name: str
    address: str
    city: str


class CreateSportComplexRequest(BaseModel):
    name: str
    address: str
    city: str


@router.get("", response_model=list[SportComplex])
async def list_sport_complexes(
    _: User = Depends(get_current_user),
) -> list[dict]:
    return _sport_complexes


@router.get("/{complex_id}", response_model=SportComplex)
async def get_sport_complex(
    complex_id: str,
    _: User = Depends(get_current_user),
) -> dict:
    match = next((c for c in _sport_complexes if c["id"] == complex_id), None)
    if match is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Sport complex not found")
    return match


@router.post("", response_model=SportComplex, status_code=201)
async def create_sport_complex(
    body: CreateSportComplexRequest,
    _: User = Depends(require_roles(Role.MANAGER, Role.OWNER)),
) -> dict:
    new_complex = {
        "id": str(len(_sport_complexes) + 1),
        "name": body.name,
        "address": body.address,
        "city": body.city,
    }
    _sport_complexes.append(new_complex)
    return new_complex
