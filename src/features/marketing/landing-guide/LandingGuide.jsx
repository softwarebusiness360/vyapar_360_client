import React, { useEffect, useMemo, useReducer, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Bot, MessageCircle, RotateCcw, X } from "lucide-react";
import { LANDING_GUIDE_CONTENT } from "./landingGuideContent";
import { GUIDE_EVENTS, GUIDE_STEPS, initialLandingGuideState, resolveLandingGuide } from "./landingGuideFlow";
import { noopLandingGuideEventPort } from "./landingGuideEvents";
import { LANDING_GUIDE_ACTIONS } from "./landingGuideRoutes";
import { createWhatsAppContactHref } from "./landingGuideWhatsApp";

const interactiveSelector = "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])";

export default function LandingGuide({
  content = LANDING_GUIDE_CONTENT,
  actions = LANDING_GUIDE_ACTIONS,
  eventPort = noopLandingGuideEventPort,
  whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER,
}) {
  const reducer = useMemo(
    () => (state, event) => resolveLandingGuide(state, event, { content, actions }),
    [content, actions],
  );
  const [state, dispatch] = useReducer(reducer, initialLandingGuideState);
  const [showDesktopLauncher, setShowDesktopLauncher] = React.useState(false);
  const launcherRef = useRef(null);
  const panelRef = useRef(null);
  const headingRef = useRef(null);
  const backRef = useRef(null);
  const wasOpenRef = useRef(false);
  const open = state.step !== GUIDE_STEPS.CLOSED;
  const whatsappHref = createWhatsAppContactHref(whatsappNumber);

  useEffect(() => {
    const update = () => setShowDesktopLauncher(window.scrollY >= window.innerHeight * 0.25);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      headingRef.current?.focus();
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = previousOverflow; };
    }
    if (wasOpenRef.current) launcherRef.current?.focus();
    return undefined;
  }, [open, state.step]);

  const emit = (name, payload) => eventPort?.emit?.(name, payload);
  const openGuide = () => {
    dispatch({ type: GUIDE_EVENTS.OPEN });
    emit("chatbot_opened");
  };
  useEffect(() => {
    const openFromSupport = () => openGuide();
    window.addEventListener("vyapar360:open-support", openFromSupport);
    return () => window.removeEventListener("vyapar360:open-support", openFromSupport);
  });
  const closeGuide = () => {
    dispatch({ type: GUIDE_EVENTS.CLOSE });
    emit("chatbot_closed");
  };
  const chooseBusiness = (businessId) => {
    dispatch({ type: GUIDE_EVENTS.CHOOSE_BUSINESS, businessId });
    emit("chatbot_option_selected", { optionId: businessId });
  };
  const goBack = () => {
    dispatch({ type: GUIDE_EVENTS.BACK });
    emit("chatbot_back_selected");
  };
  const reset = () => {
    dispatch({ type: GUIDE_EVENTS.RESET });
    emit("chatbot_reset");
  };
  const handlePanelKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeGuide();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...(panelRef.current?.querySelectorAll(interactiveSelector) || [])];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (document.activeElement === headingRef.current) {
      event.preventDefault();
      const forwardTarget = state.step === GUIDE_STEPS.BUSINESS_TYPE ? first : backRef.current;
      (event.shiftKey ? last : forwardTarget || first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const heading = state.step === GUIDE_STEPS.BUSINESS_TYPE
      ? content.prompt
      : state.step === GUIDE_STEPS.UNAVAILABLE
        ? state.result?.title || "This path isn't available right now"
        : state.result?.title;

  return (
    <>
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={openGuide}
          aria-expanded="false"
          aria-haspopup="dialog"
          aria-controls="landing-guide-panel"
          className={`fixed bottom-5 left-5 right-auto z-50 h-14 rounded-full bg-gradient-to-r from-brand to-fuchsia-500 pl-4 pr-5 text-white shadow-glow inline-flex items-center gap-2 border border-white/10 backdrop-blur transition-[transform,opacity] hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base motion-reduce:transition-none lg:left-auto lg:right-5 ${showDesktopLauncher ? "lg:opacity-100 lg:pointer-events-auto" : "lg:opacity-0 lg:pointer-events-none"}`}
          data-testid="landing-guide-launcher"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          <span className="font-medium">Need help?</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[80]" data-testid="landing-guide-overlay">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close automated guide"
            onClick={closeGuide}
            tabIndex={-1}
            data-testid="landing-guide-backdrop"
          />
          <aside
            ref={panelRef}
            id="landing-guide-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="landing-guide-heading"
            onKeyDown={handlePanelKeyDown}
            className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-hidden rounded-t-3xl border border-line bg-bg-surface shadow-2xl sm:inset-x-auto sm:bottom-24 sm:right-5 sm:w-[400px] sm:max-w-[calc(100vw-40px)] sm:rounded-2xl"
            data-testid="landing-guide-panel"
          >
            <div className="flex items-center justify-between border-b border-line bg-bg-elevated/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-brand/30 bg-brand-soft">
                  <Bot className="h-5 w-5 text-brand" aria-hidden="true" />
                </span>
                <div>
                  <div className="font-display font-medium">Vyapar360 Guide</div>
                  <div className="text-xs text-ink-muted">Automated guidance</div>
                </div>
              </div>
              <button
                type="button"
                onClick={closeGuide}
                className="grid min-h-11 min-w-11 place-items-center rounded-full border border-line bg-bg-elevated text-ink-secondary hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Close guide"
                data-testid="landing-guide-close"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-[calc(85dvh-68px)] overflow-y-auto p-5 sm:max-h-[520px]">
              {(state.step === GUIDE_STEPS.RESULT || state.step === GUIDE_STEPS.UNAVAILABLE) && (
                <button
                  ref={backRef}
                  type="button"
                  onClick={goBack}
                  className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-ink-secondary hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-brand"
                  data-testid="landing-guide-back"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                </button>
              )}

              <h2
                ref={headingRef}
                id="landing-guide-heading"
                tabIndex={-1}
                className="text-2xl font-medium outline-none"
                data-testid="landing-guide-heading"
              >
                {heading}
              </h2>
              <div className="sr-only" role="status" aria-live="polite">{heading}</div>

              {state.step === GUIDE_STEPS.BUSINESS_TYPE && (
                <div className="mt-5 grid gap-3" data-testid="landing-guide-business-options">
                  <p className="text-sm text-ink-secondary">Choose your business type.</p>
                  {Object.values(content.businesses || {}).map((option) => (
                    <Choice key={option.id} option={option} onClick={() => chooseBusiness(option.id)} />
                  ))}
                </div>
              )}

              {state.step === GUIDE_STEPS.RESULT && (
                <div className="mt-4" data-testid="landing-guide-result">
                  <p className="text-sm leading-relaxed text-ink-secondary">{state.result.guidance}</p>
                  <Link
                    to={state.action.to}
                    onClick={() => emit("chatbot_action_selected", { actionId: state.action.id })}
                    className="btn-primary mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2"
                    data-testid={`landing-guide-action-${state.action.id}`}
                  >
                    {state.action.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              )}

              {state.step === GUIDE_STEPS.UNAVAILABLE && (
                <div className="mt-4 text-sm text-ink-secondary" data-testid="landing-guide-unavailable">
                  <p>{state.result?.guidance}</p>
                  <p className="mt-2">Choose another option or close the guide.</p>
                </div>
              )}

              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => emit("chatbot_whatsapp_selected")}
                  className="btn-ghost mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2"
                  aria-label="Contact Vyapar360 on WhatsApp (opens in a new tab)"
                  data-testid="landing-guide-whatsapp"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Contact us on WhatsApp
                </a>
              )}

              {state.step !== GUIDE_STEPS.BUSINESS_TYPE && (
                <button
                  type="button"
                  onClick={reset}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-ink-secondary hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-brand"
                  data-testid="landing-guide-reset"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start over
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function Choice({ option, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card-surface card-hover flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:ring-2 focus-visible:ring-brand"
      data-testid={`landing-guide-option-${option.id}`}
    >
      <span className="font-medium">{option.label}</span>
      <ArrowRight className="h-4 w-4 text-brand" aria-hidden="true" />
    </button>
  );
}
