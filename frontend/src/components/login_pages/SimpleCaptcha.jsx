import { useState, useEffect } from 'react';
import './SimpleCaptcha.css';

const SimpleCaptcha = ({ onCaptchaChange }) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isValid, setIsValid] = useState(false);

  const generateNewCaptcha = () => {
    const newNum1 = Math.floor(Math.random() * 10);
    const newNum2 = Math.floor(Math.random() * 10);
    setNum1(newNum1);
    setNum2(newNum2);
    setUserAnswer('');
    setIsValid(false);
    onCaptchaChange(false);
  };

  useEffect(() => {
    generateNewCaptcha();
  }, []);

  const handleAnswerChange = (e) => {
    const answer = e.target.value;
    setUserAnswer(answer);
    const correctAnswer = num1 + num2;
    const isValidAnswer = parseInt(answer) === correctAnswer;
    setIsValid(isValidAnswer);
    onCaptchaChange(isValidAnswer);
  };

  return (
    <div className="captcha-container">
      <div className="captcha-problem">
        {num1} + {num2} = ?
      </div>
      <input
        type="number"
        value={userAnswer}
        onChange={handleAnswerChange}
        placeholder="Enter answer"
        className={`captcha-input ${isValid ? 'valid' : ''}`}
      />
      <button type="button" onClick={generateNewCaptcha} className="refresh-captcha">
        <i className="fas fa-sync-alt"></i>
      </button>
    </div>
  );
};

export default SimpleCaptcha; 