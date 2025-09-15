'use server';

import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { Course, StudySession } from "./types";

export const logStudySession = async (
    userId: string,
    courseName: string,
    duration: number,
    notes?: string,
) => {
    // 1. Find the course ID from the course name
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, where('uid', '==', userId), where('name', '==', courseName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.warn(`Could not log study session: Course "${courseName}" not found for user ${userId}.`);
        return null;
    }

    const courseDoc = querySnapshot.docs[0];
    const courseId = courseDoc.id;

    // 2. Create the study session object
    const newSessionData: Omit<StudySession, 'id'> = {
        uid: userId,
        courseId,
        date: new Date().toISOString(),
        duration, // in minutes
        notes: notes || `Logged automatically from daily plan for ${courseName}.`,
    };

    // 3. Save it to Firestore
    try {
        const docRef = await addDoc(collection(db, 'study-sessions'), newSessionData);
        return { id: docRef.id, ...newSessionData };
    } catch (e) {
        console.error("Error adding study session document: ", e);
        return null;
    }
};
