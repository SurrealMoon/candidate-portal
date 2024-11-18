import { createCandidate } from '../services/candidateService';
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './InterviewRecordingPage.css';
import { getInterviewById, getQuestionsInPackage } from '../services/interviewService';
import useCandidateStore from '../stores/useCandidateStore';
import axios from 'axios';


const uploadVideo = async (file, interviewId, candidateId) => {
    const formData = new FormData();
    formData.append('video', file, 'recorded-video.webm'); // Dosya adı eklendi
    formData.append('interviewId', interviewId); // interviewId'yi ekleyin
    formData.append('candidateId', candidateId); // candidateId'yi ekleyin


    console.log("Uploading video file:", file);
    console.log("FormData:", [...formData.entries()]);

    try {
        const response = await axios.post('/upload', formData
        );

        if (response.ok) {
            const { videoUrl } = await response.json();
            console.log('Video URL:', videoUrl);
            return videoUrl;
        } else {
            const errorText = await response.text();
            console.error("Server error response:", errorText);
            throw new Error('Video yüklenemedi');
        }
    } catch (error) {
        console.error("Video upload failed:", error);
        throw error;
    }
};

const CandidateInfoPopup = ({ onClose, interviewId }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const error = useCandidateStore((state) => state.error);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const kvkkChecked = document.getElementById('kvkk').checked;
    
        if (firstName && lastName && email && phoneNumber && kvkkChecked) {
            const candidateData = {
                firstName,
                lastName,
                email,
                phone: phoneNumber.trim(), // phone olarak gönderiyoruz
                interviewId,
            };
    
            try {
                const newCandidate = await createCandidate(candidateData);
                console.log("New candidate created:", newCandidate);
                onClose(newCandidate); // Pop-up'ı kapat ve veriyi aktar
            } catch (err) {
                console.error('Error adding candidate:', err);
                alert(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } else {
            alert('Lütfen tüm alanları doldurun ve KVKK onayını kabul edin.');
        }
    };
    

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2 className="popup-header">Kişisel Bilgilerinizi Girin</h2>
                <form onSubmit={handleSubmit} className="popup-input-container">
                    <input 
                        type="text" 
                        className="popup-input" 
                        placeholder="İsim" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                    />
                    <input 
                        type="text" 
                        className="popup-input" 
                        placeholder="Soyisim" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                    />
                    <input 
                        type="email" 
                        className="popup-input" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                    <input 
                        type="tel" 
                        className="popup-input" 
                        placeholder="Telefon Numarası" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                    />
                    <button type="submit" className="popup-button">Onayla</button>
                </form>
                {error && <p className="error">{error}</p>}
                <div className="kvkk-container">
                    <p>Kişisel Verilerinizin Korunması Kanunu (KVKK) metnini okuyarak onayladığınızı belirtirsiniz.</p>
                    <div className="kvkk-checkbox">
                        <input type="checkbox" id="kvkk" />
                        <label htmlFor="kvkk">KVKK metnini onaylıyorum</label>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InterviewRecordingPage = ({ onSubmit }) => {
    const { id: interviewId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [recording, setRecording] = useState(false);
    const [timer, setTimer] = useState(0);
    const [showEndPopup, setShowEndPopup] = useState(false);
    const [candidateInfo, setCandidateInfo] = useState(null);
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [recordedChunks, setRecordedChunks] = useState([]);

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const interviewData = await getInterviewById(interviewId);
    
                // Gelen veriyi kontrol edelim
                console.log("Interview Data:", interviewData);
    
                const packageQuestionsRaw = await getQuestionsInPackage(interviewData.selectedPackage);
                console.log("Raw Package Questions:", packageQuestionsRaw);
    
                // Package questions'ı diziye çevir
                const packageQuestions = Array.isArray(packageQuestionsRaw) ? packageQuestionsRaw : [];
    
                // Soruların formatlanması
                const formattedPackageQuestions = packageQuestions.map((q) => ({
                    ...q,
                    time: q.time / 60, // Saniyeyi dakikaya çevirme
                }));
    
                // Debug: Paket sorularını loglayalım
                console.log("Formatted Package Questions:", formattedPackageQuestions);
    
                const formattedCustomQuestions = Array.isArray(interviewData.customQuestions)
                    ? interviewData.customQuestions.map((q, index) => ({
                        questionText: q.questionText,
                        options: [],
                        answer: null,
                        time: q.time,
                        order: formattedPackageQuestions.length + index + 1,
                    }))
                    : [];
    
                const allQuestions = [...formattedPackageQuestions, ...formattedCustomQuestions];
                setQuestions(allQuestions);
    
                console.log("Loaded questions in fetchInterview:", allQuestions);
            } catch (error) {
                console.error("Error fetching interview or questions:", error);
                alert("Mülakat veya soru paketi bulunamadı.");
            }
        };
    
        fetchInterview();
    }, [interviewId]);
    

    useEffect(() => {
        if (questions.length > 0) {
        }
    }, [questions]);
    
    useEffect(() => {
        if (!recording || showEndPopup || questions.length === 0) return;
    
        const currentQuestionTime = questions[currentQuestionIndex]?.time * 60 || 60; // Süreyi saniyeye çevir
        let localTimer = 0;
    
        const interval = setInterval(() => {
            localTimer++;
            setTimer(localTimer);
    
            if (localTimer >= currentQuestionTime) {
                clearInterval(interval);
                handleNextQuestion();
            }
        }, 1000);
    
        return () => clearInterval(interval);
    }, [recording, currentQuestionIndex, questions, showEndPopup]);
    

    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                console.log("Media stream acquired:", stream);
                videoRef.current.srcObject = stream;
    
                const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
                mediaRecorderRef.current = mediaRecorder;
    
                mediaRecorder.ondataavailable = (event) => {
                    console.log("ondataavailable called");
                    if (event.data && event.data.size > 0) {
                        console.log("Chunk size:", event.data.size);
                        setRecordedChunks((prev) => {
                            const updatedChunks = [...prev, event.data];
                            console.log("Updated recordedChunks:", updatedChunks);
                            return updatedChunks;
                        });
                    } else {
                        console.warn("No data chunk available or empty.");
                    }
                };
    
                mediaRecorder.onstop = () => {
                    console.log("MediaRecorder stopped. Final recorded chunks:", recordedChunks);
                };
    
                mediaRecorder.start(1000); // Her 1 saniyede bir veri parçası al
                console.log("MediaRecorder started with timeslice.");
                setRecording(true);
            })
            .catch((err) => {
                console.error("Failed to access media devices:", err);
                alert("Kamera veya mikrofon erişim izni reddedildi. Lütfen izin verin ve tekrar deneyin.");
            });
    };
    

    const stopRecording = async () => {
        // MediaRecorder durduruluyor
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            console.log("Stopping MediaRecorder...");
            mediaRecorderRef.current.stop();
        }
    
        // Video akışı durduruluyor
        if (videoRef.current.srcObject) {
            console.log("Stopping video stream...");
            videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        }
        setRecording(false);
    
        console.log("Final recordedChunks:", recordedChunks);
        if (recordedChunks.length === 0) {
            console.error("No recorded video chunks available.");
            alert("Video kaydedilmedi. Lütfen tekrar deneyin.");
            return;
        }
    
        // Video blob oluşturuluyor
        const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
        console.log("Recorded video blob size:", videoBlob.size);
    
        if (videoBlob.size === 0) {
            console.error("Recorded video is empty.");
            alert("Video kaydedilmedi. Lütfen tekrar deneyin.");
            return;
        }
    
        try {
            // Interview ID ve Candidate ID bilgileri
            const interviewId = candidateInfo?.interviewId; // `candidateInfo`'dan alınır
            const candidateId = candidateInfo?._id; // Adayın veritabanı ID'si
    
            if (!interviewId || !candidateId) {
                console.error("Interview ID or Candidate ID is missing.");
                alert("Mülakat bilgileri eksik. Video yüklenemedi.");
                return;
            }
    
            console.log("Uploading video with interviewId and candidateId:", {
                interviewId,
                candidateId,
            });
    
            // Video yükleniyor
            await uploadVideo(videoBlob, interviewId, candidateId);
            console.log("Video successfully uploaded.");
        } catch (error) {
            console.error("Video upload failed:", error);
            alert("Video yüklenemedi. Lütfen tekrar deneyin.");
        }
    };
    
    

    const handleNextQuestion = () => {
        const nextIndex = currentQuestionIndex + 1;
    
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
            setTimer(0);
            console.log("Moving to next question:", questions[nextIndex]?.questionText);
        } else {
            stopRecording();
            setShowEndPopup(true);
        }
    };
    

    const calculateTotalTime = () => {
        if (questions.length === 0) {
            return 0; // Eğer soru yoksa toplam süreyi 0 döndür
        }
    
      
    
        return questions.reduce((total, question) => {
            const questionTime = (question.time || 0) * 60; // Dakikayı saniyeye çevir
            return total + questionTime; // Saniye cinsinden topla
        }, 0);
    };
    
    const totalTime = questions.length > 0 ? calculateTotalTime() : 0;
    const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
    
    
    
    return (
        <div className="interview-recording-page">
            <div className="background-circles">
                {[...Array(12)].map((_, index) => (
                    <div key={index} className="circle"></div>
                ))}
            </div>
            {!candidateInfo && <CandidateInfoPopup onClose={setCandidateInfo} interviewId={interviewId} />}
            {candidateInfo && (
                <div className="content">
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }}>{Math.round(progress)}%</div>
                    </div>
                    <div className="video-container">
                        <video ref={videoRef} autoPlay muted></video>
                    </div>
                    <div className="info-container">
                        <h3>Soru {currentQuestionIndex + 1}: {questions[currentQuestionIndex]?.questionText}</h3>
                        <div className="question-timer">
                            <div>Kalan Süre: <span>{timer}s</span></div>
                            <div>Toplam Süre: <span>{totalTime}s</span></div>
                        </div>
                        <div className="buttons">
                            <button className="skip-button" onClick={handleNextQuestion}>Next</button>
                            <button className="start-button" onClick={startRecording} disabled={showEndPopup}>
                                {recording ? "Recording..." : "Start"}
                            </button>
                        </div>
                    </div>
                    {showEndPopup && (
                        <div className="popup-overlay">
                            <div className="popup-content">
                                <h2>Mülakat sonlanmıştır, katılımınız için teşekkür ederiz.</h2>
                                <button onClick={() => window.location.reload()}>Çıkış Yap</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};    

export default InterviewRecordingPage;
