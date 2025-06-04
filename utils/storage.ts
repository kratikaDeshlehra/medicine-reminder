import AsyncStorage from '@react-native-async-storage/async-storage'

const MEDICATIONS_KEY = "@medications";
const DOSE_HISTORY_KEY = "@dose_history";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  startDate: string;
  duration: string;
  color: string;
  reminderEnabled: boolean;
  currentSupply: number;
  totalSupply: number;
  refillAt: number;
  refillReminder: boolean;
  lastRefillDate?: string;
  notes?: string;
}

export interface DoseHistory {
  id: string;
  medicationId: string;
  timestamp: string;
  taken: boolean;
}


export async function getMedications(): Promise<Medication[]> {
  try {
    const data = await AsyncStorage.getItem(MEDICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting medications:", error);
    return [];
  }
}


export async function addMedication(medication: Medication): Promise<void> {
  try {
    const medications = await getMedications();
    medications.push(medication);
    await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
  } catch (error) {
    console.error("Error adding medication:", error);
    throw error;
  }
}


export async function getDoseHistory(): Promise<DoseHistory[]> {
  try {
    const data = await AsyncStorage.getItem(DOSE_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting dose history:", error);
    return [];
  }
}

export async function getTodaysDoses(): Promise<DoseHistory[]> {
  try {
    const history = await getDoseHistory();
    const today = new Date().toDateString();
    return history.filter(
      (dose) => new Date(dose.timestamp).toDateString() === today
    );
  } catch (error) {
    console.error("Error getting today's doses:", error);
    return [];
  }
}

export async function recordDose(
  doseId: string,
): Promise<void> {
  try {
    const history = await getDoseHistory();
    const dose = history.find(d => d.id === doseId);
    if (dose && !dose.taken) {
      dose.taken = true;
      await AsyncStorage.setItem(DOSE_HISTORY_KEY, JSON.stringify(history));

      // Update medication supply if taken


      const meds = await getMedications();
      const med = meds.find(m => m.id === dose.medicationId);
      if (med && med.currentSupply > 0) {
        med.currentSupply -= 1;
        await updateMedication(med);
      }
      
    }
  } catch (error) {
    console.error("Error recording dose:", error);
    throw error;
  }
}

export async function updateMedication(
  updatedMedication: Medication
): Promise<void> {
  try {
    const medications = await getMedications();
    const index = medications.findIndex(
      (med) => med.id === updatedMedication.id
    );
    if (index !== -1) {
      medications[index] = updatedMedication;
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
    }
  } catch (error) {
    console.error("Error updating medication:", error);
    throw error;
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([MEDICATIONS_KEY, DOSE_HISTORY_KEY]);
  } catch (error) {
    console.error("Error clearing data:", error);
    throw error;
  }
}

export async function deleteMedication(id: string): Promise<void> {
  try {
    const medications = await getMedications();
    const updatedMedications = medications.filter((med) => med.id !== id);
    await AsyncStorage.setItem(
      MEDICATIONS_KEY,
      JSON.stringify(updatedMedications)
    );
  } catch (error) {
    console.error("Error deleting medication:", error);
    throw error;
  }
}


export async function addDoses(medication: Medication): Promise<void> {
  try {
    const historyRaw = await AsyncStorage.getItem(DOSE_HISTORY_KEY);
    const history: DoseHistory[] = historyRaw ? JSON.parse(historyRaw) : [];


    const startDate = new Date(medication.startDate);
    const duration = parseInt(medication.duration, 10);
    const times = medication.times;

    for (let day = 0; day < duration; day++) {
      const baseDate = new Date(startDate);
      baseDate.setDate(baseDate.getDate() + day);

      for (const timeStr of times) {
        const [hours, minutes] = timeStr.split(":").map(Number);
        const doseDateTime = new Date(baseDate);
        doseDateTime.setHours(hours, minutes, 0, 0);

        const newDose: DoseHistory = {
          id: Math.random().toString(36).substr(2, 9),
          medicationId: medication.id,
          timestamp: doseDateTime.toISOString(),
          taken: false,
        };

        history.push(newDose);
      }
    }

    await AsyncStorage.setItem(DOSE_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to generate dose history:", error);
    throw error;
  }
};


