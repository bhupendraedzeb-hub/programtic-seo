from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.schemas import UserResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def me(current_user: dict = Depends(get_current_user)):
    return UserResponse(id=current_user["id"], email=current_user["email"])
