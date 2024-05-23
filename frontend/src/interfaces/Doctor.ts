export interface DoctorData {
  page_info: {
    page_count: number
    item_count: number
    page: number
  }
  doctors: Doctor[]
}

interface Doctor {
  doctor_id: number
  account_id: number
  fee_per_patient: string
  isOnline: boolean
  profile_picture: string
  experience: number
  name: string
  specialization: string
}

export interface IDoctorProfile {
  email: string;
  name: string;
  profile_picture: string;
  experience: string;
  fee_per_patient: string;
  specialization_name: string;
}

export interface DoctorSpecialization {
  id: number
  name: string
}