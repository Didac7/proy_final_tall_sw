/**
 * HelpAgent — Agente Asistente Virtual Interactivo y de Onboarding.
 * Combina un tour guiado interactivo de la interfaz y un chatbot de soporte integrado con la API de OpenAI (gpt-5.4).
 */
import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface TourStep {
  selector: string;
  title: string;
  description: string;
  position: 'right' | 'left' | 'bottom' | 'top';
}

export default function HelpAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: '¡Hola! Soy tu Asistente Virtual ICPC UAGRM. 🤖\n\n¿Quieres que te muestre un recorrido guiado por la interfaz o tienes alguna duda sobre el uso del sistema?',
      sender: 'agent',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ---- Estados del Tour Interactivo ----
  const [tourActive, setTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const [pulseStyle, setPulseStyle] = useState<React.CSSProperties>({});

  const tourSteps: TourStep[] = [
    {
      selector: '[data-tour="tour-dashboard"]',
      title: '📊 Panel Principal (Dashboard)',
      description: 'Aquí puedes ver un resumen de tu actividad, tus últimas entregas evaluadas y estadísticas de rendimiento personal.',
      position: 'right'
    },
    {
      selector: '[data-tour="tour-problemas"]',
      title: '📝 Banco de Problemas',
      description: 'Accede al listado de ejercicios de programación disponibles. Puedes resolverlos en Python o Java con soporte de evaluación inmediata.',
      position: 'right'
    },
    {
      selector: '[data-tour="tour-competencias"]',
      title: '🏆 Competencias y Torneos',
      description: 'Registra a tu equipo en las competencias oficiales de la UAGRM, compite en tiempo real con cronómetro y revisa el ranking de posiciones.',
      position: 'right'
    },
    {
      selector: '[data-tour="tour-equipos"]',
      title: '👥 Equipos de Programación',
      description: 'Crea o únete a un equipo competitivo de la facultad junto a tus compañeros y un Coach asignado.',
      position: 'right'
    },
    {
      selector: '[data-tour="tour-admin-panel"]',
      title: '⚙️ Panel de Control Administrativo',
      description: 'Si eres Coach o Administrador, aquí puedes gestionar el banco de problemas (crear, editar, subir casos de prueba), administrar usuarios y diseñar torneos.',
      position: 'right'
    },
    {
      selector: '[data-tour="tour-role-badge"]',
      title: '👤 Tu Rol y Nivel de Acceso',
      description: 'Este indicador muestra tu rol actual dentro del sistema (Estudiante, Coach o Administrador). Las opciones del menú se adaptan según tu nivel.',
      position: 'bottom'
    },
    {
      selector: '[data-tour="tour-logout"]',
      title: '🚪 Salir de la Plataforma',
      description: 'Haz clic aquí para cerrar tu sesión de forma segura una vez que termines de programar o competir.',
      position: 'bottom'
    }
  ];

  // Auto-scroll al final del chat cuando hay mensajes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Recalcular posición del tour cuando cambia de paso
  useEffect(() => {
    if (!tourActive) return;
    
    const updatePosition = () => {
      const step = tourSteps[tourStepIndex];
      if (!step) return;

      const element = document.querySelector(step.selector);
      if (!element) {
        // Si el elemento no es visible en pantalla (ej. menú de admin oculto para estudiantes), saltar al siguiente
        handleNextTourStep();
        return;
      }

      const rect = element.getBoundingClientRect();
      const popoverPadding = 12;

      // Calcular posiciones de popover flotante
      let top = 0;
      let left = 0;

      switch (step.position) {
        case 'right':
          top = rect.top + window.scrollY + (rect.height / 2) - 80;
          left = rect.right + window.scrollX + popoverPadding;
          break;
        case 'left':
          top = rect.top + window.scrollY + (rect.height / 2) - 80;
          left = rect.left + window.scrollX - 320 - popoverPadding;
          break;
        case 'bottom':
          top = rect.bottom + window.scrollY + popoverPadding;
          left = rect.left + window.scrollX + (rect.width / 2) - 150;
          break;
        case 'top':
          top = rect.top + window.scrollY - 160 - popoverPadding;
          left = rect.left + window.scrollX + (rect.width / 2) - 150;
          break;
      }

      setPopoverStyle({
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 9999,
        transition: 'all 0.3s ease-in-out'
      });

      // Efecto de pulso/foco sobre el elemento
      setPulseStyle({
        position: 'absolute',
        top: `${rect.top + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        pointerEvents: 'none',
        zIndex: 9998,
        boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.4), 0 0 0 9999px rgba(10, 25, 41, 0.75)',
        borderRadius: '8px',
        transition: 'all 0.3s ease-in-out'
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [tourActive, tourStepIndex]);

  const startTour = () => {
    setIsOpen(false); // Cerrar chat temporalmente
    setTourStepIndex(0);
    setTourActive(true);
  };

  const handleNextTourStep = () => {
    if (tourStepIndex < tourSteps.length - 1) {
      setTourStepIndex(prev => prev + 1);
    } else {
      endTour();
    }
  };

  const handlePrevTourStep = () => {
    if (tourStepIndex > 0) {
      setTourStepIndex(prev => prev - 1);
    }
  };

  const endTour = () => {
    setTourActive(false);
    setIsOpen(true); // Reabrir chat para feedback
    setMessages(prev => [
      ...prev,
      {
        id: `tour-end-${Date.now()}`,
        text: '¡Espero que el tour te haya sido de gran ayuda! Recuerda que puedes preguntarme cualquier duda sobre las funciones aquí en el chat. 🚀',
        sender: 'agent',
        timestamp: new Date()
      }
    ]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input.trim();
    setInput('');
    setLoading(true);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: userMsgText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await api.post('/assistant/', { message: userMsgText });
      
      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        text: res.data.response,
        sender: 'agent',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (err: any) {
      const errMsg: Message = {
        id: `error-${Date.now()}`,
        text: 'Lo siento, no pude comunicarme con mi servidor. Por favor, asegúrate de que el servidor Django esté activo e intenta de nuevo.',
        sender: 'agent',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ---- TOUR GUIADO ELEMENTOS DE SUPERPOSICIÓN ---- */}
      {tourActive && (
        <>
          {/* Foco de Pulso */}
          <div style={pulseStyle} className="animate-pulse-soft" />

          {/* Popover del Globo de Ayuda */}
          <div
            style={popoverStyle}
            className="w-[320px] card bg-surface-900 border-2 border-purple-500/50 shadow-2xl p-5 flex flex-col space-y-4"
          >
            <div className="flex items-center justify-between border-b border-surface-800 pb-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest font-display">Asistente ICPC</span>
              <span className="text-xs text-surface-400 font-mono">
                Paso {tourStepIndex + 1} de {tourSteps.length}
              </span>
            </div>
            
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-surface-100">{tourSteps[tourStepIndex].title}</h4>
              <p className="text-xs text-surface-300 leading-relaxed font-sans">
                {tourSteps[tourStepIndex].description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-800/40">
              <button
                onClick={endTour}
                className="text-xs text-red-400/80 hover:text-red-400 transition-colors font-display"
              >
                Omitir
              </button>
              
              <div className="flex gap-2">
                {tourStepIndex > 0 && (
                  <button
                    onClick={handlePrevTourStep}
                    className="btn btn-secondary btn-sm text-[11px] py-1 px-2.5"
                  >
                    Atrás
                  </button>
                )}
                <button
                  onClick={handleNextTourStep}
                  className="btn btn-primary btn-sm text-[11px] py-1 px-3 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400"
                >
                  {tourStepIndex === tourSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---- WIDGET DE CHAT FLOTANTE ---- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {/* Ventana de Chat */}
        {isOpen && (
          <div className="w-[360px] md:w-[400px] h-[500px] card glass border border-purple-500/20 shadow-2xl flex flex-col mb-4 overflow-hidden animate-slide-up">
            
            {/* Header del Chat */}
            <div className="p-4 bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border-b border-purple-550/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-purple-600/30">
                    🤖
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-surface-900 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-surface-100 font-display">Tutor de Guía Virtual</h3>
                  <p className="text-[10px] text-purple-400 font-display font-medium">ChatGPT 5.4 Active</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-surface-400 hover:text-surface-100 p-1.5 rounded-lg hover:bg-surface-800/40 transition-colors"
                aria-label="Cerrar chat"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mensajes del Chat */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-950/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed font-sans ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                        : 'bg-surface-800 text-surface-200 border border-surface-700/60 rounded-tl-none whitespace-pre-wrap shadow-sm'
                    }`}
                  >
                    {msg.text}
                    {msg.id === 'welcome' && (
                      <div className="mt-3">
                        <button
                          onClick={startTour}
                          className="w-full btn btn-primary btn-sm bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-[11px] py-1.5 shadow-md shadow-purple-600/10"
                        >
                          🚀 Iniciar Recorrido Guiado
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-surface-800 border border-surface-700/60 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input del Chat */}
            <form onSubmit={handleSend} className="p-3 border-t border-surface-800/40 bg-surface-900 flex gap-2">
              <input
                type="text"
                placeholder="Escribe una pregunta sobre la plataforma..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="input py-2 px-3 text-xs bg-surface-950 placeholder-surface-650"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 btn-primary bg-gradient-to-r from-purple-600 to-indigo-500 rounded-xl"
                aria-label="Enviar"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* Botón Circular del Avatar Flotante */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Cerrar asistente' : 'Abrir asistente virtual'}
          className={`w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-2xl flex items-center justify-center text-white shadow-xl shadow-purple-600/30 transition-all duration-300 hover:scale-105 active:scale-95 border-2 ${
            isOpen ? 'border-purple-300' : 'border-purple-500/20'
          }`}
        >
          {isOpen ? '✖' : '🤖'}
        </button>
      </div>
    </>
  );
}
