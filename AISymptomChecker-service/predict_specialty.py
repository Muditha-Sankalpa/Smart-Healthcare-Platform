import joblib
import numpy as np

def predict_specialty(symptoms, age, gender, severity="moderate", duration_days=7):
    """
    Predict medical specialty based on symptoms, age, gender, severity, and duration.
    
    Args:
        symptoms: List of symptom strings
        age: Patient age (int)
        gender: Patient gender ('M' or 'F')
        severity: Symptom severity ('mild', 'moderate', or 'severe')
        duration_days: Duration of symptoms in days (int)
        
    Returns: dict with prediction details
    """
    try:
        # Load artifacts (cache if making multiple predictions)
        clf = joblib.load('specialty_model.pkl')
        mlb = joblib.load('symptom_mlb.pkl')
        gender_le = joblib.load('gender_le.pkl')
        severity_le = joblib.load('severity_le.pkl')
        specialty_le = joblib.load('specialty_le.pkl')
        scaler = joblib.load('feature_scaler.pkl')

        # Validate inputs
        if not symptoms or len(symptoms) == 0:
            raise ValueError("At least one symptom required")
        if not (0 <= age <= 120):
            raise ValueError("Age must be between 0 and 120")
        if gender not in gender_le.classes_:
            raise ValueError(f"Invalid gender. Allowed values: {list(gender_le.classes_)}")
        if severity not in severity_le.classes_:
            raise ValueError(f"Invalid severity. Allowed values: {list(severity_le.classes_)}")
        if not (0 < duration_days < 365):
            raise ValueError("Duration must be between 1 and 365 days")

        # Transform inputs
        symptoms_encoded = mlb.transform([symptoms])
        gender_encoded = gender_le.transform([gender])
        severity_encoded = severity_le.transform([severity])
        
        # Scale numerical features
        numerical_features = np.array([[age, duration_days]])
        scaled_numerical = scaler.transform(numerical_features)
        
        # Ensure correct feature dimensions and order
        X_input = np.hstack([
            symptoms_encoded,
            scaled_numerical,
            gender_encoded.reshape(-1, 1),
            severity_encoded.reshape(-1, 1)
        ])

        # Make prediction
        pred = clf.predict(X_input)
        proba = clf.predict_proba(X_input)[0]
        
        # Get best specialty and corresponding experience recommendation
        predicted_specialty = specialty_le.inverse_transform(pred)[0]
        
        # Determine recommended experience based on severity
        if severity == "mild":
            min_experience = 1
        elif severity == "moderate":
            min_experience = 5
        else:  # severe
            min_experience = 10
        
        return {
            "predicted_specialty": predicted_specialty,
            "confidence": float(proba.max()),
            "probabilities": dict(zip(specialty_le.classes_, proba.tolist())),
            "recommended_min_experience": min_experience,
            "input": {
                "symptoms": symptoms,
                "age": age,
                "gender": gender,
                "severity": severity,
                "duration_days": duration_days
            }
        }

    except Exception as e:
        return {
            "error": str(e),
            "input": {
                "symptoms": symptoms,
                "age": age,
                "gender": gender,
                "severity": severity,
                "duration_days": duration_days
            }
        }

# Example usage
if __name__ == "__main__":
    result = predict_specialty(
        symptoms=["Fever", "Cough"],
        age=35,
        gender="F",
        severity="moderate",
        duration_days=5
    )
    
    if 'error' in result:
        print("Prediction failed:", result['error'])
    else:
        print(f"Predicted Specialty: {result['predicted_specialty']} (Confidence: {result['confidence']:.2f})")
        print(f"Recommended minimum experience: {result['recommended_min_experience']} years")
        print("Detailed probabilities:")
        for spec, prob in sorted(result['probabilities'].items(), key=lambda x: x[1], reverse=True)[:5]:
            print(f"- {spec}: {prob:.2f}")
