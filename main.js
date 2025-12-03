// Play hum AFTER the user clicks (browser autoplay fix)
document.addEventListener("click", () => {
    const hum = document.getElementById("hum");
    hum.volume = 0.5;

    hum.play().catch(err => {
        console.warn("Audio blocked:", err);
    });
}, { once: true });
