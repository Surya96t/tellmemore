# TellMeMore/Frontend-ui/utils/dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

# Corrected import path to get the settings object
from config import settings

# This defines the token URL for our API, used for authentication.
# The tokenUrl points to the endpoint where a client can get a token.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="backend-api/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Dependency function to get the current user from a JWT token.
    Raises an HTTPException if the token is invalid or the user can't be found.
    """
    # Define a custom exception for credentials error
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the JWT token to get the user data
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        # If there's any error decoding the token, raise the exception
        raise credentials_exception

    # Here you would typically fetch the user from your database using the user_id.
    # For this example, we'll return a simple dictionary.
    # We will also print the user_id to confirm it is being passed.
    print(f"DEBUG: Successfully authenticated user with ID: {user_id}")
    return {"id": user_id, "username": user_id}