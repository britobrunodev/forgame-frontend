from enum import StrEnum


class Role(StrEnum):
    PLAYER = "player"
    MANAGER = "manager"
    OWNER = "owner"
    PROFESSOR = "professor"
    SCORER = "scorer"


GRANTABLE_ROLES: frozenset[Role] = frozenset({
    Role.MANAGER,
    Role.OWNER,
    Role.PROFESSOR,
    Role.SCORER,
})
