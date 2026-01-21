// src/lib/api.ts
// Configuration for the Flask backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Check if backend is available
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/classes`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const API_ENDPOINTS = {
  register: `${API_BASE_URL}/api/register`,
  recognize: `${API_BASE_URL}/api/recognize`,
  students: `${API_BASE_URL}/api/students`,
  attendance: `${API_BASE_URL}/api/attendance`,
  manualAttendance: `${API_BASE_URL}/api/attendance/manual`,
  classes: `${API_BASE_URL}/api/classes`,
};

// Helper function to convert image to base64
export const imageToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper function to capture canvas as base64
export const canvasToBase64 = (canvas: HTMLCanvasElement): string => {
  return canvas.toDataURL('image/jpeg', 0.8);
};

// API call to register a new student
export const registerStudent = async (data: {
  name: string;
  student_id: string;
  email?: string;
  class_section?: string;
  image: string; // base64 encoded
}) => {
  const response = await fetch(API_ENDPOINTS.register, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to register student');
  }

  return response.json();
};

// API call to recognize a face
export const recognizeFace = async (data: {
  image: string; // base64 encoded
  class_section?: string;
}) => {
  const response = await fetch(API_ENDPOINTS.recognize, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Face not recognized');
  }

  return response.json();
};

// API call to get students list
export const getStudents = async (params?: {
  class_section?: string;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.class_section) queryParams.append('class_section', params.class_section);
  if (params?.search) queryParams.append('search', params.search);

  const response = await fetch(
    `${API_ENDPOINTS.students}?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch students');
  }

  return response.json();
};

// API call to mark manual attendance
export const markManualAttendance = async (data: {
  student_id: string;
  class_section?: string;
}) => {
  const response = await fetch(API_ENDPOINTS.manualAttendance, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mark attendance');
  }

  return response.json();
};

// API call to get attendance records
export const getAttendance = async (params?: {
  date?: string;
  class_section?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.append('date', params.date);
  if (params?.class_section) queryParams.append('class_section', params.class_section);

  const response = await fetch(
    `${API_ENDPOINTS.attendance}?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch attendance');
  }

  return response.json();
};import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";