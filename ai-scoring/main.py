from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import os
from supabase import create_client

app = FastAPI()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key) if url and key else None

class ScoreRequest(BaseModel):
    user_id: str

@app.post("/score")
async def compute_score(req: ScoreRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    # Fetch metrics
    res = supabase.table("user_metrics").select("*").eq("user_id", req.user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User metrics not found")
    m = res.data[0]
    total = m.get("total_contributions", 1)
    on_time = total - m.get("late_payments", 0) - m.get("missed_payments", 0)
    punctuality = on_time / total
    stability = min(1.0, m.get("groups_completed", 0) / 5)
    volume = min(1.0, m.get("total_contributions", 0) / 50)
    score = int(300 + punctuality*400 + stability*100 + volume*100)
    final = min(900, max(0, score))
    # Update trust_scores
    supabase.table("trust_scores").upsert({"user_id": req.user_id, "score": final, "updated_at": "now()"}).execute()
    return {"trust_score": final}
