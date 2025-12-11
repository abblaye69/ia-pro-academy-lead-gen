// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
  initFormHandler();
});

function initFormHandler() {
  const form = document.getElementById('optin-form');
  const submitBtn = document.getElementById('submit-btn');
  const feedback = document.getElementById('form-feedback');
  
  // URL relative vers la fonction Netlify (Proxy)
  const API_ENDPOINT = '/.netlify/functions/submit-lead';
  
  if(!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const consent = document.getElementById('consent').checked;
    
    if (!consent) {
      showFeedback("Veuillez accepter la politique de confidentialité.", "error");
      return;
    }
    
    // État de chargement
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="animate-spin inline-block mr-2">↻</span> Traitement...`;
    
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, consent })
      });
      
      if (response.ok) {
        showFeedback("✅ Succès ! Votre kit a été envoyé par email.", "success");
        form.reset();
        
        // Tracking conversion (Optionnel)
        // if(window.fbq) fbq('track', 'Lead');
      } else {
        throw new Error('Erreur API');
      }
    } catch (error) {
      console.error(error);
      showFeedback("Une erreur est survenue. Veuillez réessayer.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      lucide.createIcons(); // Ré-init des icônes
    }
  });
  
  function showFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');
    
    if (type === 'success') {
      feedback.classList.add('bg-green-100', 'text-green-700', 'block');
    } else {
      feedback.classList.add('bg-red-100', 'text-red-700', 'block');
    }
  }
}
