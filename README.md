# Medical Transport Form Scanner (MTS)

An application designed for medical transport drivers to scan "Verordnung einer Krankenbeförderung" forms, extract trip details, and integrate with navigation/billing systems.

## 🚀 Core Features
1. **OCR Scanning**: Extract "Abholort" (Pickup), "Zielort" (Destination), and "Fahrtart" (One-way/Return).
2. **Data Validation**: Use Maps API to verify and format addresses.
3. **Manual Review**: UI for drivers to verify and correct scanned data.
4. **Navigation**: Direct link to Google/Apple Maps.
5. **Billing Integration**: Save trip data for insurance processing.

## 🛠️ Tech Stack
- **Frontend**: React Native & Expo (TypeScript)
- **OCR Engine**: Google ML Kit / Tesseract Python pre-processing scripts
- **Database**: Supabase (PostgreSQL + Auth)

## 🔒 Data Privacy (GDPR Compliance)
- No unencrypted storage of medical forms on devices.
- Preference for on-device OCR.
- GDPR-compliant cloud processing if necessary.

## 📅 Development Phases
1. **Phase 1: Research & Prototyping** (Current)
   - Analyze form layout.
   - Test OCR accuracy on samples.
2. **Phase 2: MVP Development**
   - Camera integration.
   - OCR parsing logic.
   - Basic UI for data review.
3. **Phase 3: Integration**
   - Maps API.
   - Database storage.
4. **Phase 4: Polishing & Testing**
   - UI/UX improvements.
   - Real-world testing.
