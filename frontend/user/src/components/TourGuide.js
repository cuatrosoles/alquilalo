import React, { useState, useEffect, useRef } from "react";

// --- Este componente ha sido modificado para mejorar el efecto visual ---
const TourGuide = ({ steps, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState({ display: "none" });
  const [tooltipStyle, setTooltipStyle] = useState({ display: "none" });
  const tooltipRef = useRef(null);

  useEffect(() => {
    const step = steps[currentStep];
    if (!step) return;

    try {
      const element = document.querySelector(step.selector);
      if (!element) {
        setHighlightStyle({ display: "none" });
        setTooltipStyle({
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "block",
        });
        return;
      }

      element.scrollIntoView({ behavior: "smooth", block: "center" });

      const timer = setTimeout(() => {
        const rect = element.getBoundingClientRect();
        const padding = 10;

        setHighlightStyle({
          width: `${rect.width + padding}px`,
          height: `${rect.height + padding}px`,
          top: `${rect.top - padding / 2}px`,
          left: `${rect.left - padding / 2}px`,
          // CORRECCIÓN: Se usa box-shadow para crear el overlay. Esto deja el área resaltada clara.
          boxShadow: "0 0 0 5000px rgba(0, 0, 0, 0.65)",
          border: "3px solid #F97316", // Un borde naranja para destacar más.
          borderRadius: "8px",
          transition: "all 0.3s ease-in-out",
          display: "block",
        });

        if (tooltipRef.current) {
          const tooltipRect = tooltipRef.current.getBoundingClientRect();
          let top = rect.bottom + 15;
          let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          if (left < 10) left = 10;
          if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
          }
          if (top + tooltipRect.height > window.innerHeight - 10) {
            top = rect.top - tooltipRect.height - 15;
          }
          setTooltipStyle({
            top: `${top}px`,
            left: `${left}px`,
            transition: "all 0.3s ease-in-out",
            display: "block",
          });
        }
      }, 300);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Error al procesar el paso del tour:", error);
      onClose();
    }
  }, [currentStep, steps, onClose]);

  const handleNext = () =>
    currentStep < steps.length - 1
      ? setCurrentStep(currentStep + 1)
      : onClose();
  const handlePrev = () => currentStep > 0 && setCurrentStep(currentStep - 1);
  const handleSkip = () => onClose();

  if (!steps || steps.length === 0 || !steps[currentStep]) return null;
  const stepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50" onClick={handleSkip}>
      {/* El div de resaltado ahora crea el overlay oscuro a su alrededor */}
      <div
        className="absolute pointer-events-none"
        style={highlightStyle}
      ></div>

      {/* Tooltip con la información */}
      <div
        ref={tooltipRef}
        className="absolute z-[51] p-5 bg-white rounded-lg shadow-xl w-80 md:w-96"
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()} // Evita que el tour se cierre al hacer clic en el tooltip
      >
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          {stepData.title}
        </h3>
        <p className="text-gray-600 mb-4">{stepData.content}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">
            {currentStep + 1} / {steps.length}
          </span>
          <div className="space-x-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              >
                Anterior
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-md hover:bg-orange-600 transition"
            >
              {currentStep === steps.length - 1 ? "Finalizar" : "Siguiente"}
            </button>
          </div>
        </div>
        <button
          onClick={handleSkip}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          aria-label="Cerrar tour"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TourGuide;
