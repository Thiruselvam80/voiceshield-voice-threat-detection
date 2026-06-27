"""
prepare_synthetic.py
--------------------
Generates diverse, UNIQUE labelled training samples.

Uses cross-product expansion (templates x params) + light augmentation.

Target unique counts:
  scam        600
  violence    400
  emergency   350
  safe        400
"""

import random
import itertools
import pandas as pd
from pathlib import Path

ROOT     = Path(__file__).resolve().parents[3]
SAVE_DIR = ROOT / "training" / "nlp" / "data"
SAVE_DIR.mkdir(parents=True, exist_ok=True)

random.seed(42)


def cross_expand(templates, params, target):
    """Generate unique texts via cross-product of templates x param combos."""
    results = []
    keys   = list(params.keys())
    vals   = list(params.values())
    for tmpl in templates:
        for combo in itertools.product(*vals):
            kv = dict(zip(keys, combo))
            try:
                results.append(tmpl.format(**kv))
            except KeyError:
                results.append(tmpl)
    results = list(dict.fromkeys(results))   # deduplicate preserving order
    random.shuffle(results)
    return results[:target]


def augment(texts, target):
    """Expand a list to `target` by applying light transformations."""
    subs = [
        ("I will", "I'm going to"),
        ("I'll",   "I am going to"),
        ("you",    "your family"),
        ("Please", "Kindly"),
        ("now",    "immediately"),
        ("Help",   "Assistance needed"),
        ("Call",   "Contact"),
    ]
    augmented = list(texts)
    src = list(texts)
    idx = 0
    while len(augmented) < target:
        orig = src[idx % len(src)]
        sub_from, sub_to = subs[idx % len(subs)]
        new_text = orig.replace(sub_from, sub_to, 1)
        if new_text != orig and new_text not in augmented:
            augmented.append(new_text)
        idx += 1
        if idx > target * 10:
            break
    return augmented[:target]


# ──────────────────────────────────────────────────────────────────────────────
# SCAM  (cross-product of 35 templates x params = 1000s of combos)
# ──────────────────────────────────────────────────────────────────────────────

SCAM_TEMPLATES = [
    "I am calling from {bank}. Your account has been compromised. Please share your OTP immediately.",
    "This is {bank} security team. Transfer {amount} to a safe account to prevent fraud.",
    "Your {bank} account will be blocked in {deadline}. Share your OTP to prevent this.",
    "Sir, your {bank} debit card has been used fraudulently. Confirm your card number and CVV.",
    "We are calling from {bank} KYC department. Your KYC is expired. Share Aadhaar to update.",
    "Your {bank} account shows unusual login from {city}. Share OTP on your mobile to verify.",
    "Hello, this is {bank} customer care. Urgent problem with your account detected.",
    "Your {bank} FD is maturing today. Call back on this number to reinvest.",
    "URGENT: Your {bank} account is under review. Share details to avoid suspension.",
    "This is {bank} fraud department. Your card was used in {city}. Confirm or block immediately.",
    "Your electricity connection will be disconnected in {deadline} due to unpaid dues. Press 1.",
    "This is BESCOM electricity department. Pay {amount} or your power will be cut in {deadline}.",
    "Power department calling. Immediate payment of {amount} required to avoid disconnection today.",
    "Congratulations! You have been pre-approved for a loan of {amount}. Pay {fee} processing fee.",
    "You qualify for a personal loan of {amount} with zero interest. Pay {fee} to receive funds.",
    "Our bank offers loans up to {amount}. Pay {fee} registration fee to receive within 24 hours.",
    "Easy loan of {amount} approved for you. Transfer {fee} as processing fee to release the funds.",
    "Congratulations! You have won {prize} in our lucky draw. Pay {fee} tax to claim your reward.",
    "Your mobile number selected for {prize}. Transfer {fee} to receive your winnings today.",
    "You are the lucky winner of {prize}. Call immediately. Pay {fee} processing fee to claim.",
    "This is Income Tax department. You have pending dues of {amount}. Pay now to avoid arrest.",
    "CBI officer calling. Case registered against your Aadhaar. Pay {amount} to settle the case.",
    "Your PAN card is used in money laundering. Pay {amount} to {bank} to clear your name.",
    "This is a court order. Pay {amount} within {deadline} or face immediate arrest.",
    "TRAI is disconnecting your number due to illegal activity. Call back to speak to an officer.",
    "Your SIM will be blocked in {deadline}. Call this number immediately to avoid disconnection.",
    "Narcotics department calling. Parcel in your name contains drugs. Pay {amount} to clear.",
    "Amazon refund of {amount} pending. Share your bank details to receive it within {deadline}.",
    "Your Amazon order is stuck in customs. Pay {fee} immediately to release it.",
    "Share your OTP to complete your {bank} transaction verification before {deadline}.",
    "This is a final notice from {bank}. Pay {amount} to avoid legal proceedings against you.",
    "We have a job offer with salary of {amount} per month. Pay {fee} registration fee to start.",
    "Work from home opportunity. Earn {amount} monthly. Pay {fee} to register and begin.",
    "You have unclaimed insurance money of {amount} at {bank}. Pay {fee} to release it.",
    "Your account at {bank} has been flagged. Please call back immediately to resolve.",
]

SCAM_PARAMS = {
    "bank":     ["SBI", "HDFC", "ICICI", "Axis Bank", "Kotak", "PNB", "your bank", "the Reserve Bank"],
    "amount":   ["50,000", "1,00,000", "25,000", "2,00,000", "75,000", "10,000"],
    "fee":      ["999", "1,999", "5,000", "2,499"],
    "prize":    ["10 lakh rupees", "5 lakh rupees", "iPhone 15", "a new car"],
    "deadline": ["30 minutes", "2 hours", "24 hours", "before 6 PM today"],
    "city":     ["Mumbai", "Delhi", "Bangalore", "Chennai"],
}


# ──────────────────────────────────────────────────────────────────────────────
# VIOLENCE  (40 base templates, augmented to 400)
# ──────────────────────────────────────────────────────────────────────────────

VIOLENCE_BASE = [
    "I will kill you if you don't comply.",
    "You are dead to me. I'm coming for you.",
    "I'll hurt you and your family. This is your last warning.",
    "Say that again and I will destroy you completely.",
    "I know where you live and I'm coming for you tonight.",
    "I'll make you pay for this. You won't survive.",
    "Consider this your final warning before I take violent action.",
    "I will make you suffer. You have no idea what I'm capable of.",
    "You are going to deeply regret crossing me. I promise you.",
    "One more word and I'll end this permanently for you.",
    "I have a weapon and I'm not afraid to use it on you.",
    "You should fear me. I've done this before and I'll do it again.",
    "This is a death threat. Take it very seriously.",
    "Your life is in danger. I will find you wherever you go.",
    "Nobody can protect you from what is coming your way.",
    "I'll make sure you never bother anyone again.",
    "You crossed the wrong person. You will deeply regret this decision.",
    "I'll burn everything you own to the ground and watch it.",
    "You and everyone you love will suffer the consequences.",
    "I have nothing to lose. You should be very afraid of me.",
    "I'm warning you for the last time. Back off or face the consequences.",
    "I've already planned exactly what I'm going to do to you.",
    "You better run because I'm coming and there's nowhere to hide.",
    "I'll destroy your life piece by piece until you have nothing.",
    "This is not an empty threat. I will absolutely follow through.",
    "You'll be sorry you ever crossed me. That is a guarantee.",
    "I'm going to end you and there is nothing you can do to stop me.",
    "Enjoy your last few days of peace. Things are about to get very bad.",
    "I will hunt you down no matter where you go or hide.",
    "Touch my family again and I'll put you in the ground.",
    "You made the biggest mistake of your life messing with me today.",
    "I swear I will make you pay for every single thing you've done.",
    "You're going to wish you never met me in your entire life.",
    "Stay away from me or I'll take drastic action. This is your only chance.",
    "I am capable of very bad things. Don't push me any further.",
    "You have 24 hours to fix this or I'll come find you myself.",
    "I'll hurt you so bad you'll never fully recover from it.",
    "I've sent people after you already. You need to watch your back.",
    "You think this is a joke? I'm completely serious. Leave me alone.",
    "I'm going to make your life a living nightmare until you stop.",
]


# ──────────────────────────────────────────────────────────────────────────────
# EMERGENCY  (parameterized to ~350 unique samples)
# ──────────────────────────────────────────────────────────────────────────────

EMERGENCY_TEMPLATES = [
    "Please help {pronoun}! Someone is attacking {pronoun} right now!",
    "Call the police immediately! There's a {person} with a {weapon} outside!",
    "Help! {pronoun} has been kidnapped. Please trace this call and send help.",
    "{pronoun} need an ambulance right now. There has been a serious accident at {location}.",
    "Please send help. {pronoun} trapped and cannot get out.",
    "Emergency! There's a fire in {location} and people are stuck inside.",
    "Someone broke into {location}. Please call the police now.",
    "{pronoun} having a heart attack. Please call for medical help immediately.",
    "{pronoun} friend has been stabbed. Urgent help needed at {location}.",
    "Please call 112. There's a person threatening {pronoun} with a {weapon}.",
    "Help {pronoun} please. {pronoun} being held against {pronoun} will.",
    "There's been a terrible accident at {location}. Please send ambulances.",
    "Call emergency services now. There's a child drowning at {location}.",
    "{pronoun} need immediate help. {pronoun} husband is unconscious at {location}.",
    "Please send police. There is domestic violence happening at {location}.",
    "Help! {pronoun} can hear screaming. Someone is in danger at {location}.",
    "This is a real emergency. Please don't hang up. {pronoun} need help now.",
    "{pronoun} bleeding badly from a wound. {pronoun} need medical help right now.",
    "Someone has been shot near {location}. Please call an ambulance immediately.",
    "{pronoun} under attack at {location}. Please call police and send help.",
    "There's a gas leak in {location}. Everyone needs to evacuate now.",
    "{pronoun} found an unconscious person at {location}. Urgent medical help needed.",
    "{pronoun} child is having a severe allergic reaction. Call for help now.",
    "There's a car crash at {location}. Multiple people are injured.",
    "Someone collapsed at {location}. {pronoun} need emergency medical assistance.",
    "Please help, {pronoun} lost at {location} and it's getting dark. Send rescue.",
    "A man with a {weapon} is threatening people at {location}. Call police.",
    "{pronoun} witnessed a robbery. The criminals are still at {location}.",
    "Flood waters are rising rapidly at {location}. Stranded on the rooftop.",
    "{pronoun} can smell smoke in {location}. Think there's a fire. Send help.",
]

EMERGENCY_PARAMS = {
    "pronoun": ["I", "We", "My", "She's", "He's"],
    "person":  ["man", "woman", "armed person", "stranger"],
    "weapon":  ["gun", "knife", "weapon"],
    "location": ["my house", "the building", "the main road", "the market", "this location"],
}


# ──────────────────────────────────────────────────────────────────────────────
# SAFE  (parameterized to ~400 unique samples)
# ──────────────────────────────────────────────────────────────────────────────

SAFE_TEMPLATES = [
    "Hello {name}, how are you doing today?",
    "I'm calling to check on the status of my {item} order.",
    "Can you please help me with my {service} subscription renewal?",
    "I wanted to confirm my appointment for {day}.",
    "Hi, this is a follow-up call about our {topic} conversation.",
    "Could you please transfer me to {dept} support?",
    "I have a question about my recent account statement for {month}.",
    "I'm just checking if my {item} has been delivered yet.",
    "Good {time}! I'd like to make a reservation for {day} please.",
    "Can you update my address in your system?",
    "I need to reschedule my appointment to {day} please.",
    "Could you explain the charge on my {month} bill?",
    "I'm interested in learning more about your {plan} plan.",
    "I received my {item} today. Thank you so much!",
    "Can I speak to someone from {dept} support team?",
    "I'm having trouble logging into my account. Can you help?",
    "I would like to cancel my {service} subscription.",
    "What documents do I need for my appointment on {day}?",
    "Is there a way to track my {item} shipment online?",
    "Can you confirm my account balance for {month}?",
    "I'd like to add a new user to my {service} account.",
    "What is the return policy for {item} purchased online?",
    "I received a wrong item instead of my {item}. Can you help?",
    "Is the {plan} offer available in my city as well?",
    "Can you help me reset my password for the {service} account?",
]

SAFE_PARAMS = {
    "name":    ["sir", "ma'am", "friend"],
    "item":    ["order", "package", "delivery", "product"],
    "service": ["internet", "mobile", "premium", "basic"],
    "day":     ["Monday", "tomorrow", "next week", "Friday"],
    "topic":   ["billing", "technical", "account", "service"],
    "dept":    ["technical", "billing", "customer", "sales"],
    "month":   ["last month", "this month", "December", "November"],
    "time":    ["morning", "afternoon", "evening"],
    "plan":    ["premium", "standard", "basic", "enterprise"],
}


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

def main():
    print("Generating synthetic training data...")

    scam_texts      = cross_expand(SCAM_TEMPLATES,      SCAM_PARAMS,      target=600)
    violence_texts  = augment(VIOLENCE_BASE,                               target=400)
    emergency_texts = cross_expand(EMERGENCY_TEMPLATES, EMERGENCY_PARAMS, target=350)
    safe_texts      = cross_expand(SAFE_TEMPLATES,      SAFE_PARAMS,      target=400)

    rows = (
        [{"text": t, "label": 1, "class": "scam"}      for t in scam_texts]
      + [{"text": t, "label": 3, "class": "violence"}  for t in violence_texts]
      + [{"text": t, "label": 4, "class": "emergency"} for t in emergency_texts]
      + [{"text": t, "label": 0, "class": "safe"}      for t in safe_texts]
    )

    random.shuffle(rows)
    df = pd.DataFrame(rows)

    print(f"\nTotal synthetic samples: {len(df)}")
    print("\nClass distribution:")
    print(df["class"].value_counts())

    save_path = SAVE_DIR / "synthetic.csv"
    df.to_csv(save_path, index=False)
    print(f"\nSaved: {save_path}")


if __name__ == "__main__":
    main()
