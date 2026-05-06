from __future__ import annotations

import httpx


async def get_google_user_info(access_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )

    if response.status_code != 200:
        raise ValueError("Invalid Google access token")

    data = response.json()
    return {
        "google_id": data["sub"],
        "email": data["email"],
        "name": data.get("name", ""),
        "picture_url": data.get("picture"),
    }
