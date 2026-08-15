"""
All user-facing template strings live here, separate from endpoint logic.
"""
import hashlib

CRYSTAL_BALL_APPROVED = [
    "If approved: {improve}% chance of stabilizing within {time}.",
    "If approved: the system estimates a {improve}% chance of returning to safe range within {time}.",
]

CRYSTAL_BALL_IGNORED = [
    "If ignored: {risk}% chance of {consequence} within {time}.",
    "If left unaddressed: {risk}% chance of escalating to {consequence} within {time}.",
]


def _pick_variant(options: list[str], seed: str) -> str:
    index = int(hashlib.md5(seed.encode()).hexdigest(), 16) % len(options)
    return options[index]


def build_crystal_ball(incident: dict) -> dict:
    severity_risk = {"low": 20, "medium": 45, "high": 70, "critical": 90}
    risk = severity_risk.get(incident["severity"], 50)
    improve = min(100 - risk + 15, 97)

    approved_text = _pick_variant(CRYSTAL_BALL_APPROVED, incident["id"]).format(
        improve=improve, time="15 minutes"
    )
    ignored_text = _pick_variant(CRYSTAL_BALL_IGNORED, incident["id"] + "x").format(
        risk=risk, consequence="cascading equipment failure", time="30 minutes"
    )
    return {"if_approved": approved_text, "if_ignored": ignored_text}