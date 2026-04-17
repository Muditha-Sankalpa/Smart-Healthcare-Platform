// frontend/src/components/auth/DoctorProfilePanel.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProfile } from "../../api/doctorApi"; // ✅ Uses correct function
import { ErrorMessage } from "../shared";
import {
  COLORS, inputStyle, inputStyleNoIcon, Field, PrimaryButton,
  IconUser, IconEmail, IconArrowRight,
} from "./authTheme";

const CheckboxOption = ({ label, checked, onChange }) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 14px",
      border: "1.5px solid " + (checked ? COLORS.accent : COLORS.border),
      borderRadius: 10,
      background: checked ? "#f0f1fb" : COLORS.surface,
      cursor: "pointer",
      flex: 1,
      fontSize: 14,
      color: COLORS.primary,
      fontWeight: 500,
      transition: "all 0.2s",
    }}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{ accentColor: COLORS.accent, width: 16, height: 16, cursor: "pointer" }}
    />
    {label}
  </label>
);

export default function DoctorProfilePanel() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    name: storedUser.name || "",
    email: storedUser.email || "",
    contactNumber: "",
    specialty: "",  // ✅ Correct field name
    licenseNumber: "",
    experience: "",  // ✅ Correct field name (number)
    qualification: "",  // ✅ Correct field name (singular)
    consultationFee: "",  // ✅ REQUIRED - Added
    notificationPreference: ["email", "sms"],  // ✅ Added
    isVirtualConsultationAvailable: false,  // ✅ Added
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const toggleNotification = (channel) => {
    setForm((prev) => {
      const has = prev.notificationPreference.includes(channel);
      const next = has
        ? prev.notificationPreference.filter((c) => c !== channel)
        : [...prev.notificationPreference, channel];
      return { ...prev, notificationPreference: next };
    });
  };

  const handleSubmit = async () => {
    try {
      setError("");
      // ✅ Validate required fields per schema
      if (!form.name || !form.specialty || !form.licenseNumber || !form.consultationFee) {
        setError("Name, Specialty, License Number, and Consultation Fee are required");
        return;
      }
      if (form.notificationPreference.length === 0) {
        setError("Please select at least one notification preference");
        return;
      }
      setLoading(true);
      await createProfile(form); // ✅ Calls doctorApi.createProfile
      navigate("/doctor/profile");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 26, color: COLORS.primary, marginBottom: 6 }}>Doctor Profile</h2>
      <p style={{ fontSize: 13, color: COLORS.mutedText, marginBottom: 24 }}>Complete your professional details</p>
      {error && <ErrorMessage message={error} />}

      <Field label="Full name" icon={IconUser}>
        <input type="text" value={form.name} onChange={update("name")} style={inputStyle} />
      </Field>

      <Field label="Email" icon={IconEmail}>
        <input
          type="email"
          value={form.email}
          readOnly
          style={{ ...inputStyle, background: "#f0f1fb", cursor: "not-allowed" }}
        />
      </Field>

      <Field label="Contact number">
        <input type="tel" placeholder="+94 77 123 4567" value={form.contactNumber} onChange={update("contactNumber")} style={inputStyleNoIcon} />
      </Field>

      {/* ✅ Corrected field names */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Specialty">
          <input type="text" placeholder="e.g. Cardiology, Pediatrics" value={form.specialty} onChange={update("specialty")} style={inputStyleNoIcon} />
        </Field>
        <Field label="License Number">
          <input type="text" placeholder="e.g. SL-MED-12345" value={form.licenseNumber} onChange={update("licenseNumber")} style={inputStyleNoIcon} />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Qualification">
          <input type="text" placeholder="e.g. MBBS, MD" value={form.qualification} onChange={update("qualification")} style={inputStyleNoIcon} />
        </Field>
        <Field label="Experience (years)">
          <input type="number" min="0" value={form.experience} onChange={update("experience")} style={inputStyleNoIcon} />
        </Field>
      </div>

      {/* ✅ REQUIRED: Consultation Fee */}
      <Field label="Consultation Fee (LKR)">
        <input type="number" min="0" value={form.consultationFee} onChange={update("consultationFee")} style={inputStyleNoIcon} />
      </Field>

      {/* ✅ Notification Preferences */}
      <Field label="Notification preference">
        <div style={{ display: "flex", gap: 10 }}>
          <CheckboxOption
            label="Email"
            checked={form.notificationPreference.includes("email")}
            onChange={() => toggleNotification("email")}
          />
          <CheckboxOption
            label="SMS"
            checked={form.notificationPreference.includes("sms")}
            onChange={() => toggleNotification("sms")}
          />
        </div>
      </Field>

      {/* ✅ Virtual Consultation Toggle */}
      <Field label="Virtual Consultation">
        <CheckboxOption
          label="Available for online consultations"
          checked={form.isVirtualConsultationAvailable}
          onChange={() => setForm({ ...form, isVirtualConsultationAvailable: !form.isVirtualConsultationAvailable })}
        />
      </Field>

      <div style={{ marginTop: 20 }}>
        <PrimaryButton color={COLORS.accent} icon={<IconArrowRight />} onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Complete Setup"}
        </PrimaryButton>
      </div>
    </div>
  );
}