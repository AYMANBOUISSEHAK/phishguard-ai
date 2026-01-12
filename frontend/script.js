const backendURL = "https://uncontinent-untenderized-lori.ngrok-free.dev";

// ---- PHISHING ANALYSIS ----
async function analyzePhishing() {
    const text = document.getElementById("phishingInput").value;
    const resultDiv = document.getElementById("phishingResult");

    if (text.trim() === "") {
        resultDiv.innerHTML = "Veuillez entrer un texte.";
        return;
    }

    // --- Animation scanning ON ---
    resultDiv.classList.add("scanning");
    resultDiv.innerHTML = "<em>Analyse en cours...</em>";

    try {
        const response = await fetch(`${backendURL}/detect`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        const raw = await response.text();
        let data;

        try {
            data = JSON.parse(raw);
        } catch (e) {
            resultDiv.classList.remove("scanning");
            resultDiv.innerHTML = `
                <div class="phishing-card">
                    <b>Erreur :</b> Le serveur n'a pas renvoyé du JSON valide.<br>
                    <pre>${raw.substring(0, 200)}...</pre>
                </div>
            `;
            return;
        }

        // --- STOP scanning ---
        resultDiv.classList.remove("scanning");

        // 1. Probabilité formatée
        let probabilityDisplay;
        let probabilityValue = data.probability || 0;
        
        if (typeof probabilityValue === 'string') {
            probabilityValue = parseFloat(probabilityValue.replace('%', '').trim()) || 0;
        }
        
        probabilityValue = Math.max(0, Math.min(100, Math.round(probabilityValue)));
        probabilityDisplay = `${probabilityValue}%`;

        // 2. Mots-clés formatés
        let keywordsHTML = "";
        if (data.keywords && data.keywords.length > 0) {
            keywordsHTML = `
                <div class="keywords-section">
                    <p><b>Mots-clés suspects détectés :</b></p>
                    <div class="keywords-list">
                        ${data.keywords.map(k => `<span class="keyword-tag">${k}</span>`).join(' ')}
                    </div>
                </div>
            `;
        }

        // 3. Exemples similaires formatés
        let examplesHTML = "";
        if (data.similar_examples && data.similar_examples.length > 0) {
            examplesHTML = `
                <div class="similar-section">
                    <p><b>Exemples de phishing similaires :</b></p>
                    <div class="examples-list">
                        ${data.similar_examples.map((example, i) => `
                            <div class="example-item">
                                ${typeof example === 'object' ? example.text || example : example}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // 4. URLs suspectes formatées
        let urlsHTML = "";
        if (data.suspicious_urls && data.suspicious_urls.length > 0) {
            urlsHTML = `
                <div class="urls-section">
                    <p><b>URLs suspectes détectées :</b></p>
                    <div class="urls-list">
                        ${data.suspicious_urls.map((url, i) => `
                            <div class="url-item">
                                <code>${typeof url === 'object' ? url.url || url : url}</code>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // 5. URLs trouvées
        let foundUrlsHTML = "";
        if (data.found_urls && data.found_urls.length > 0) {
            foundUrlsHTML = `
                <div class="found-urls">
                    <p><b>URLs trouvées dans le texte :</b></p>
                    <div>
                        ${data.found_urls.map(url => `<code>${url}</code>`).join('<br>')}
                    </div>
                </div>
            `;
        }

        // 6. Détails techniques
        let detailsHTML = "";
        if (data.analysis_details) {
            detailsHTML = `
                <div class="details-section">
                    <p><b>Détails techniques :</b></p>
                    <p>Score mots-clés: ${data.analysis_details.keyword_score || '0'}</p>
                    <p>Score URLs: ${data.analysis_details.url_score || '0'}</p>
                    <p>Score similarité: ${data.analysis_details.similarity_score || '0'}</p>
                    <p>Score total: ${data.analysis_details.total_score || '0'}</p>
                </div>
            `;
        }

        // 7. Affichage final
        resultDiv.innerHTML = `
            <div class="phishing-card">
                <h3>🔍 Analyse de Phishing</h3>
                
                <div class="probability-display">
                    <p><b>Probabilité de phishing :</b> <span class="probability-value verdict-${data.risk_level || 'safe'}">${probabilityDisplay}</span></p>
                </div>
                
                <p><b>Verdict :</b> <span class="verdict-${data.risk_level || 'safe'}">${data.verdict || "Non déterminé"}</span></p>
                
                ${keywordsHTML}
                ${examplesHTML}
                ${urlsHTML}
                ${foundUrlsHTML}
                ${detailsHTML}
            </div>
        `;

    } catch (err) {
        resultDiv.classList.remove("scanning");
        resultDiv.innerHTML = `
            <div class="phishing-card error">
                <b>Erreur de connexion :</b> ${err.message}<br>
                Vérifiez que le backend est en ligne.
            </div>
        `;
    }
}

// ---- CHATBOT ----
const userInput = document.getElementById("userMessage");
const chatbox = document.getElementById("chatbox");

userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

async function sendMessage() {
    const msg = userInput.value.trim();
    if (msg === "") return;

    // Affiche message utilisateur
    chatbox.innerHTML += `<div class="message-user">${msg}</div>`;
    chatbox.scrollTop = chatbox.scrollHeight;
    userInput.value = "";

    // Loader bot
    const botMessageDiv = document.createElement("div");
    botMessageDiv.className = "message-bot";
    botMessageDiv.innerHTML = "<em>Thinking...</em>";
    chatbox.appendChild(botMessageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;

    try {
        const response = await fetch(`${backendURL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: msg })
        });

        const raw = await response.text();
        let data;

        try {
            data = JSON.parse(raw);
        } catch (e) {
            botMessageDiv.innerHTML = "Erreur serveur : réponse non valide.";
            return;
        }

        // Réponse du bot
        botMessageDiv.innerHTML = data.reply;
        chatbox.scrollTop = chatbox.scrollHeight;

    } catch (err) {
        botMessageDiv.innerHTML = "Erreur : impossible de récupérer la réponse.";
    }
}

// -----------------------------
// Matrix / Digital Rain (blue) |
// -----------------------------
(function() {
  const canvas = document.getElementById('matrixCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  // Configurable params (slow, subtle)
  const fontSize = Math.max(12, Math.floor(Math.min(width, height) / 80)); // responsive
  const columns = Math.floor(width / fontSize) + 1;
  const dropSpeed = 0.25 + Math.min(1.2, Math.max(0.25, Math.min(width, height) / 1500)); // small speed factor
  const fadeAlpha = 0.06; // trail fade (smaller => longer trails)
  const density = 0.6; // 0..1 how many drops per column (1 = full)
  const colorFront = '#8fd1ff'; // bright cyan for head
  const colorTail = 'rgba(70,140,255,'; // tail prefix (will add alpha)
  ctx.font = `${fontSize}px monospace`;

  // Characters: hex + some alnum
  const chars = '0123456789ABCDEF@#$%&*+-<>'.split('');

  // Initialize drops array (y position for each column)
  const drops = new Array(columns).fill(0).map(() => {
    // random start between 0 and height
    return Math.floor(Math.random() * height) * (Math.random() < 0.5 ? -1 : 1);
  });

  let lastTime = performance.now();

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    ctx.font = `${fontSize}px monospace`;
  }
  window.addEventListener('resize', resize);

  function frame(now) {
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    // slow clear with alpha to keep trails
    ctx.fillStyle = `rgba(0, 6, 14, ${fadeAlpha})`; // darker bg fade
    ctx.fillRect(0, 0, width, height);

    // draw characters column by column
    for (let i = 0; i < columns; i++) {
      // density: skip some columns randomly to reduce clutter
      if (Math.random() > density) continue;

      const x = i * fontSize;
      let y = drops[i];

      // draw a short vertical tail (3–6 chars) with decreasing alpha
      const tailLength = 3 + Math.floor(Math.random() * 4);

      for (let t = 0; t < tailLength; t++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const posY = y - t * fontSize;

        if (posY > 0 && posY < height + fontSize) {
          // head brighter
          if (t === 0) {
            ctx.fillStyle = colorFront;
            ctx.fillText(text, x, posY);
          } else {
            const alpha = (1 - (t / tailLength)) * 0.7; // fade tail
            ctx.fillStyle = colorTail + alpha + ')';
            ctx.fillText(text, x, posY);
          }
        }
      }

      // step drop forward slowly (speed scaled by delta)
      drops[i] = y + dropSpeed * fontSize * delta * 60; // normalized to 60fps

      // reset if off screen or with small random chance (to vary)
      if (drops[i] > height + fontSize || Math.random() < 0.002) {
        drops[i] = -Math.random() * height * 0.5; // restart slightly above
      }
    }

    requestAnimationFrame(frame);
  }

  // Start
  requestAnimationFrame(frame);
})();