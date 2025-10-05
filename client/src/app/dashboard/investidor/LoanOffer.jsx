"use client";
import React, { useMemo, useState, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDown, Check, X } from "lucide-react";

const START_OPTS = [
  { id: "any",    label: "Sem Preferência" },
  { id: "during", label: "Durante a Graduação" },
  { id: "after",  label: "Após a Graduação" },
];

const RULES = {
  amountMin: 1000,
  amountMax: 50000,
  termMin: 6,
  termMax: 60,
};

function StartPaySelect({ value, onChange }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative w-full">
        <Listbox.Button className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-gray-800 flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
          <span>{value?.label ?? "Tempo para início do pagamento"}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-1"
        >
          <Listbox.Options className="absolute z-50 mt-1 w-full bg-white border border-border rounded-xl shadow-xl py-1">
            {START_OPTS.map((opt) => (
              <Listbox.Option
                key={opt.id}
                value={opt}
                className={({ active }) =>
                  [
                    "cursor-pointer select-none text-sm px-3 py-2 mx-1 flex items-center justify-between",
                    "rounded-lg",
                    active ? "bg-[var(--primary)] text-white" : "text-gray-800 hover:bg-gray-50",
                  ].join(" ")
                }
              >
                {({ selected }) => (
                  <>
                    <span className={selected ? "font-medium" : "font-normal"}>
                      {opt.label}
                    </span>
                    {selected && <Check className="w-4 h-4" />}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

/**
 * Props:
 * - showPopup: boolean        -> controla a visibilidade
 * - setShowPopup: fn(bool)    -> para abrir/fechar
 * - onSubmit?: fn(payload)    -> (opcional) recebe o payload válido
 */
export default function LoanOffer({ showPopup, setShowPopup, onSubmit }) {
  if (!showPopup) return null;

  // States do form (prontos pro backend)
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState("");
  const [startPay, setStartPay] = useState(START_OPTS[0]);

  // States de validação
  const [errors, setErrors] = useState({ amount: "", term: "" });
  const [touched, setTouched] = useState({ amount: false, term: false });

  // Helpers
  const parseNumber = (v) => (v === "" || v == null ? NaN : Number(v));

  const validateAmount = (raw) => {
    const n = parseNumber(raw);
    if (isNaN(n)) return "Informe um valor válido.";
    if (n < RULES.amountMin) return `Valor mínimo é R$ ${RULES.amountMin.toLocaleString("pt-BR")}.`;
    if (n > RULES.amountMax) return `Valor máximo é R$ ${RULES.amountMax.toLocaleString("pt-BR")}.`;
    return "";
  };

  const validateTerm = (raw) => {
    const n = parseNumber(raw);
    if (isNaN(n)) return "Informe um prazo válido.";
    if (!Number.isInteger(n)) return "Prazo deve ser um número inteiro em meses.";
    if (n < RULES.termMin) return `Prazo mínimo é ${RULES.termMin} meses.`;
    if (n > RULES.termMax) return `Prazo máximo é ${RULES.termMax} meses.`;
    return "";
  };

  // Validação em tempo real
  const onAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    if (touched.amount) setErrors((p) => ({ ...p, amount: validateAmount(val) }));
  };

  const onTermChange = (e) => {
    const val = e.target.value;
    setTerm(val);
    if (touched.term) setErrors((p) => ({ ...p, term: validateTerm(val) }));
  };

  const onBlurField = (field) => {
    setTouched((p) => ({ ...p, [field]: true }));
    if (field === "amount") setErrors((p) => ({ ...p, amount: validateAmount(amount) }));
    if (field === "term") setErrors((p) => ({ ...p, term: validateTerm(term) }));
  };

  const isValid = !validateAmount(amount) && !validateTerm(term);

  // Payload pronto pro backend
  const payload = {
    amount: parseNumber(amount),       // número (ex: 15000)
    termMonths: parseNumber(term),     // número inteiro
    startPaymentTiming: startPay?.id,  // "any" | "during" | "after"
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // força validação final
    const aErr = validateAmount(amount);
    const tErr = validateTerm(term);
    setErrors({ amount: aErr, term: tErr });
    setTouched({ amount: true, term: true });
    if (aErr || tErr) return;

    // dispara callback opcional para quem chamou
    onSubmit?.(payload);

    // fecha o popup
    setShowPopup(false);
  };

  const close = () => setShowPopup(false);

  return (
    <div
      className="fixed inset-0 bg-gray-400/75 z-50 flex items-center justify-center"
      onClick={close} // clique no overlay fecha
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 w-[40%] space-y-4"
        onClick={(e) => e.stopPropagation()} // impede fechar ao clicar dentro
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Oferecer um novo empréstimo</h3>
          <button
            type="button"
            onClick={close}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Fechar"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Valor do empréstimo */}
        <div className="flex flex-col w-full text-left">
          <label className="text-sm mb-1">
            Valor do empréstimo{" "}
            <span className="text-gray-400">
              (mín R$ {RULES.amountMin.toLocaleString("pt-BR")} | máx R$ {RULES.amountMax.toLocaleString("pt-BR")})
            </span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            min={RULES.amountMin}
            max={RULES.amountMax}
            step="100"
            value={amount}
            onChange={onAmountChange}
            onBlur={() => onBlurField("amount")}
            className={`p-2 border rounded-lg ${
              errors.amount ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-[var(--primary)]"
            } focus:outline-none focus:ring-2`}
            placeholder="Ex.: 15000"
          />
          {errors.amount && <span className="text-xs text-red-600 mt-1">{errors.amount}</span>}
        </div>

        {/* Prazo de pagamento */}
        <div className="flex flex-col w-full text-left">
          <label className="text-sm mb-1">
            Prazo de pagamento{" "}
            <span className="text-gray-400">
              (mín {RULES.termMin} | máx {RULES.termMax} meses)
            </span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            min={RULES.termMin}
            max={RULES.termMax}
            step="1"
            value={term}
            onChange={onTermChange}
            onBlur={() => onBlurField("term")}
            className={`p-2 border rounded-lg ${
              errors.term ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-[var(--primary)]"
            } focus:outline-none focus:ring-2`}
            placeholder="Ex.: 24"
          />
          {errors.term && <span className="text-xs text-red-600 mt-1">{errors.term}</span>}
        </div>

        {/* Tempo para início do pagamento */}
        <div className="flex flex-col w-full text-left">
          <label className="text-sm mb-1">Tempo para início do pagamento</label>
          <StartPaySelect value={startPay} onChange={setStartPay} />
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            className="px-4 py-2 rounded-md border border-border hover:bg-gray-50"
            onClick={close}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className={`px-4 py-2 rounded-md text-white ${
              isValid ? "bg-[var(--primary)] hover:opacity-90" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Oferecer
          </button>
        </div>
      </form>
    </div>
  );
}
