# MAXHealth

MAXHealth is a telemedicine web application designed to connect patients, doctors, and pharmacy managers. Patients can purchase medicines and chat with doctors for consultations and prescriptions. Doctors can offer consultations at a set price, while pharmacy managers have the ability to sell medicines, transfer stock between pharmacy branches, and update medicine information. An admin panel is available for managing user accounts and overseeing the medicines sold by pharmacies. The platform also includes features for user registration as either a patient or a doctor.

The backend is built using `Go` with the `Gin Gonic` framework, while the frontend is developed with `React` and `TypeScript`. The application is deployed using `Docker`, with `Nginx` serving as the reverse proxy. WebSocket messaging is handled through `Centrifugo`.

Deployed on: http://103.150.116.78

Credentials:
- User
    - Email: user@example.com	
    - Password: `abcD1234`
- Pharmacy Manager
    - Email: manager@example.com	
    - Password: `abcD1234`
- Doctor
    - Email: doctor@example.com	
    - Password: `abcD1234`
- Admin
    - Email: admin@example.com
    - Password: `abcD1234`
