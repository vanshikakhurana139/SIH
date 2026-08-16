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


# ---------- Phase 1 (Red Team): Advocate / Skeptic phrasing ----------

ADVOCATE_TRACK_RECORD = [
    "This action type ({rule_id}) has succeeded {successful}/{total} times historically ({pct}% success rate).",
    "Historically, {rule_id} has a {pct}% success rate across {total} prior outcomes ({successful} successful).",
]

ADVOCATE_NO_HISTORY = [
    "This action type ({rule_id}) has no recorded failures yet — no historical objection exists.",
    "There is no failed outcome on record for {rule_id} to weigh against this recommendation.",
]

SKEPTIC_RISK_TEMPLATES = [
    "Skeptic's objection: {risk_factor}.",
    "Counter-argument: consider that {risk_factor}.",
    "Before approving, weigh this — {risk_factor}.",
]

SKEPTIC_NO_RISK_FACTOR = [
    "No specific risk factors are configured for this rule yet — treat this recommendation with baseline caution.",
    "This rule has no documented risk factors on file — the Skeptic has nothing specific to point to yet.",
]


def build_advocate_track_record(rule_id: str, successful: int, total: int, seed: str) -> str:
    pct = int(round((successful / total) * 100)) if total > 0 else 0
    template = _pick_variant(ADVOCATE_TRACK_RECORD, seed + rule_id)
    return template.format(rule_id=rule_id, successful=successful, total=total, pct=pct)


def build_advocate_no_history(rule_id: str, seed: str) -> str:
    template = _pick_variant(ADVOCATE_NO_HISTORY, seed + rule_id)
    return template.format(rule_id=rule_id)


def build_skeptic_risk_line(risk_factor: str, seed: str) -> str:
    template = _pick_variant(SKEPTIC_RISK_TEMPLATES, seed + risk_factor)
    return template.format(risk_factor=risk_factor)


def build_skeptic_no_risk_factor(seed: str) -> str:
    return _pick_variant(SKEPTIC_NO_RISK_FACTOR, seed)


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