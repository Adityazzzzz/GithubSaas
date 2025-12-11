// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcHBWtxmh9T8gvcoDSy5vHASzHzs5iHJI",
  authDomain: "shrut-koe.firebaseapp.com",
  projectId: "shrut-koe",
  storageBucket: "shrut-koe.firebasestorage.app",
  messagingSenderId: "973162581875",
  appId: "1:973162581875:web:30a0dbabf7854e84d07f06",
  measurementId: "G-BQ6KNHT470"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);

export async function uploadFile(file: File, setProgress?: (progress: number) => void) {
    return new Promise((resolve, reject) => {
        try {
            const storageRef = ref(storage, file.name)
            const uploadTask = uploadBytesResumable(storageRef, file)

            uploadTask.on('state_changed', snapshot => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
                if (setProgress) setProgress(progress)
                switch (snapshot.state) {
                    case 'paused':
                        console.log('upload is paused'); break;
                    case 'running':
                        console.log('upload is running'); break;
                }
            }, error => {
                reject(error)
            }, () => {
                getDownloadURL(uploadTask.snapshot.ref).then(downloadURL=>{
                    resolve(downloadURL)
                })
            })
        } 
        catch(error){
            console.error(error)
            reject(error)
        }
    })
}