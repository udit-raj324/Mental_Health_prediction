const API_URL = 'http://127.0.0.1:2200/predict';

const form = document.getElementById('predictForm');
const submitBtn = document.getElementById('submitBtn');
const btnLabel = submitBtn.querySelector('.btn-label');
const loader = submitBtn.querySelector('.loader');
const formMessage = document.getElementById('formMessage');
const resultValue = document.getElementById('resultValue');
const resultSummary = document.getElementById('resultSummary');

function setMessage(text, type = '') {
  formMessage.textContent = text;
  formMessage.className = 'form-message';
  if (type) formMessage.classList.add(type);
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  btnLabel.textContent = isLoading ? 'Predicting...' : 'Predict Score';
  loader.classList.toggle('hidden', !isLoading);
}

function getValue(id) {
  const element = document.getElementById(id);
  return element ? element.value : '';
}

function normalizePayload() {
  const payload = {
    Age: Number(getValue('Age')),
    Gender: getValue('Gender'),
    Country: getValue('Country').trim(),
    Academic_Level: getValue('Academic_Level'),
    Most_Used_Platform: getValue('Most_Used_Platform'),
    Purpose_Of_Use: getValue('Purpose_Of_Use'),
    Avg_Daily_Usage_Hours: Number(getValue('Avg_Daily_Usage_Hours')),
    Daily_Unlocks: Number(getValue('Daily_Unlocks')),
    Study_Hours: Number(getValue('Study_Hours')),
    Physical_Activity_Hours: Number(getValue('Physical_Activity_Hours')),
    Sleep_Hours_Per_Night: Number(getValue('Sleep_Hours_Per_Night')),
    Stress_Level: getValue('Stress_Level')
  };

  const missing = Object.entries(payload).some(([_, value]) => value === '' || value === null || Number.isNaN(value));

  if (missing) {
    throw new Error('Please complete all required fields before predicting.');
  }

  return payload;
}

function explainScore(score) {
  if (score >= 8) {
    return 'Excellent mental wellbeing profile.';
  }
  if (score >= 6) {
    return 'Moderate wellness trend. A little more balance may help.';
  }
  if (score >= 4) {
    return 'Attention advised. Consider stress reduction and healthier routines.';
  }
  return 'High-risk profile. It may be helpful to seek support and restore balance.';
}

async function predictMentalHealth() {
  try {
    const payload = normalizePayload();
    setLoading(true);
    setMessage('Running the mental health assessment...', 'success');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.detail
        ? (Array.isArray(data.detail)
            ? data.detail.map((item) => item.msg || item).join(' • ')
            : data.detail)
        : 'The server could not process this request.';
      throw new Error(message);
    }

    const predictedScore = Number(data.predicted_mental_health_score);
    if (!Number.isFinite(predictedScore)) {
      throw new Error('The server returned an invalid prediction.');
    }

    resultValue.textContent = predictedScore.toFixed(1);
    resultSummary.textContent = explainScore(predictedScore);
    setMessage('Prediction completed successfully.', 'success');
    return data;
  } catch (error) {
    resultValue.textContent = '--';
    resultSummary.textContent = 'Unable to generate a score';
    setMessage(error.message || 'Something went wrong while predicting.', 'error');
    return null;
  } finally {
    setLoading(false);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await predictMentalHealth();
});

window.predictMentalHealth = predictMentalHealth;