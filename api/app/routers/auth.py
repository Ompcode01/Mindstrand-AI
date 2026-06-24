"""Auth router — syncs Supabase users to profiles table."""
from fastapi import APIRouter, HTTPException, Header
from app.database import get_supabase
from app.models.schemas import ProfileCreate, ProfileResponse
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/auth/sync-profile")
async def sync_profile(
    data: ProfileCreate,
    authorization: str = Header(...),
):
    """Called after Supabase signup to create a profile row."""
    token = authorization.replace("Bearer ", "")
    sb = get_supabase()

    try:
        user = sb.auth.get_user(token)
        user_id = user.user.id
        email = user.user.email
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        existing = sb.table("profiles").select("*").eq("id", user_id).single().execute()
        if existing.data:
            return existing.data
    except Exception:
        pass

    try:
        result = sb.table("profiles").insert({
            "id": user_id,
            "email": email,
            "full_name": data.full_name,
            "age": data.age,
            "gender": data.gender,
        }).execute()
        return result.data[0]
    except Exception as e:
        logger.error(f"Profile creation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create profile")


@router.get("/users/me")
async def get_me(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    sb = get_supabase()

    try:
        user = sb.auth.get_user(token)
        user_id = user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    result = sb.table("profiles").select("*").eq("id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return result.data
