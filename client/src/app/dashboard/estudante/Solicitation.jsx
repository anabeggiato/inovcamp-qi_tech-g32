"use client";
import React, { useMemo, useState, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDown, Check, X, Paperclip } from "lucide-react";

/**
 * Props:
 * - showPopup: boolean
 * - setShowPopup: fn(bool)
 * - institutions: Array<{ id: string|number, name: string }>
 * - scoreData?: { credit_score: number|string, risk_band: string, fraud_status: string }
 * - onSubmit?: fn(payload)
 */
export default function Solicitation({
    showPopup,
    setShowPopup,
    institutions = [],
    scoreData = { credit_score: "", risk_band: "", fraud_status: "" },
    onSubmit,
}) {
    if (!showPopup) return null;

    // ---------- REGRAS ----------
    const RULES = {
        amountMin: 1000,
        amountMax: 50000,
        termMin: 6,
        termMax: 60,
    };

    // ---------- STATE DO FORM ----------
    const [step, setStep] = useState(1); // 1..3

    // Etapa 1
    const [amount, setAmount] = useState("");
    const [term, setTerm] = useState("");

    // Etapa 2
    const [school, setSchool] = useState(null); // {id, name}
    const [course, setCourse] = useState("");
    const [entranceYear, setEntranceYear] = useState("");
    const [graduationDate, setGraduationDate] = useState("");

    // Etapa 3 (opcionais + arquivos)
    const [purpose, setPurpose] = useState("");
    const [notes, setNotes] = useState("");
    const [files, setFiles] = useState([]);

    // ---------- VALIDAÇÃO ----------
    const [errors, setErrors] = useState({
        amount: "",
        term: "",
        school: "",
        graduationDate: "",
    });
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
        if (!Number.isInteger(n)) return "Prazo deve ser inteiro (meses).";
        if (n < RULES.termMin) return `Prazo mínimo é ${RULES.termMin} meses.`;
        if (n > RULES.termMax) return `Prazo máximo é ${RULES.termMax} meses.`;
        return "";
    };

    const validateSchool = (val) => (!val ? "Instituição é obrigatória." : "");

    const validateGradDate = (dateStr) => {
        if (!dateStr) return "Informe a previsão de formatura.";
        const today = new Date();
        const date = new Date(dateStr + "T00:00:00");
        if (isNaN(date.getTime())) return "Data inválida.";
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (date <= todayStart) return "A data de formatura deve ser no futuro.";
        return "";
    };

    // ---------- CONTROLE DE ETAPAS ----------
    const validateStep1 = () => {
        const e = {
            amount: validateAmount(amount),
            term: validateTerm(term),
        };
        setErrors((p) => ({ ...p, ...e }));
        return !e.amount && !e.term;
    };

    const validateStep2 = () => {
        const e = {
            school: validateSchool(school),
            graduationDate: validateGradDate(graduationDate),
        };
        setErrors((p) => ({ ...p, ...e }));
        return !e.school && !e.graduationDate;
    };

    const goNext = () => {
        console.log('Step atual:', step);
        if (step === 1 && !validateStep1()) {
            console.log('Falha na validação step 1');
            return;
        }
        if (step === 2 && !validateStep2()) {
            console.log('Falha na validação step 2', errors);
            return;
        }
        setStep((s) => Math.min(4, s + 1));
    };

    const goPrev = () => setStep((s) => Math.max(1, s - 1));

    // ---------- PAYLOAD ----------
    const payload = useMemo(
        () => ({
            // acadêmicos
            school_id: school?.id ?? null,
            course: course || null,
            entrance_year: entranceYear ? parseNumber(entranceYear) : null,
            graduation_date: graduationDate || null,

            // score (readonly)
            credit_score: scoreData?.credit_score ?? null,
            risk_band: scoreData?.risk_band ?? null,
            fraud_status: scoreData?.fraud_status ?? null,

            // empréstimo
            amount: parseNumber(amount),
            termMonths: parseNumber(term),

            // opcionais
            purpose: purpose || null,
            notes: notes || null,

            // arquivos
            files,
        }),
        [
            school, course, entranceYear, graduationDate,
            scoreData, amount, term, purpose, notes, files
        ]
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        // valida última etapa dependente (2 precisa estar ok)
        if (!validateStep1() || !validateStep2()) return;
        onSubmit?.(payload);
        setShowPopup(false);
    };

    const close = () => setShowPopup(false);

    // ---------- RENDER ----------
    return (
        <div
            className="fixed inset-0 bg-gray-400/75 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowPopup(false); }}
        >
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && step < 3) {
                        e.preventDefault();
                        goNext();
                    }
                }}
                className="bg-white shadow-lg rounded-2xl w-full max-w-[48rem] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5">
                    <h3 className="text-lg font-semibold">Nova Solicitação de Empréstimo</h3>
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

                {/* Stepper simples */}
                <div className="px-6 pt-2 pb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <StepDot active={step >= 1} label="Empréstimo" />
                        <div className="h-px flex-1 bg-gray-200" />
                        <StepDot active={step >= 2} label="Acadêmicos" />
                        <div className="h-px flex-1 bg-gray-200" />
                        <StepDot active={step >= 3} label="Score & Extras" />
                    </div>
                </div>

                {/* Conteúdo (scrollável, não passa da viewport) */}
                <div className="px-6 pb-6 max-h-[65vh] overflow-y-auto">
                    {step === 1 && (
                        <section className="space-y-4">
                            <h4 className="font-medium">Detalhes do Empréstimo</h4>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col">
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
                                        onChange={(e) => setAmount(e.target.value)}
                                        className={`p-2 border rounded-lg ${errors.amount ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-[var(--primary)]"
                                            } focus:outline-none focus:ring-2`}
                                        placeholder="Ex.: 15000"
                                    />
                                    {errors.amount && <span className="text-xs text-red-600 mt-1">{errors.amount}</span>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm mb-1">
                                        Prazo (meses){" "}
                                        <span className="text-gray-400">
                                            (mín {RULES.termMin} | máx {RULES.termMax})
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        min={RULES.termMin}
                                        max={RULES.termMax}
                                        step="1"
                                        value={term}
                                        onChange={(e) => setTerm(e.target.value)}
                                        className={`p-2 border rounded-lg ${errors.term ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-[var(--primary)]"
                                            } focus:outline-none focus:ring-2`}
                                        placeholder="Ex.: 24"
                                    />
                                    {errors.term && <span className="text-xs text-red-600 mt-1">{errors.term}</span>}
                                </div>
                            </div>
                        </section>
                    )}

                    {step === 2 && (
                        <section className="space-y-4">
                            <h4 className="font-medium">Dados Acadêmicos</h4>

                            <div className="flex flex-col">
                                <label className="text-sm mb-1">Instituição</label>
                                <InstitutionSelect value={school} onChange={setSchool} options={institutions} />
                                {errors.school && <span className="text-xs text-red-600 mt-1">{errors.school}</span>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-sm mb-1">Curso</label>
                                    <input
                                        type="text"
                                        className="p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                        placeholder="Ex.: Engenharia de Software"
                                        value={course}
                                        onChange={(e) => setCourse(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm mb-1">Ano de ingresso</label>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        className="p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                        placeholder="Ex.: 2023"
                                        value={entranceYear}
                                        onChange={(e) => setEntranceYear(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm mb-1">Previsão de formatura</label>
                                <input
                                    type="date"
                                    className={`p-2 border rounded-lg ${errors.graduationDate ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-[var(--primary)]"
                                        } focus:outline-none focus:ring-2`}
                                    value={graduationDate}
                                    onChange={(e) => setGraduationDate(e.target.value)}
                                />
                                {errors.graduationDate && (
                                    <span className="text-xs text-red-600 mt-1">{errors.graduationDate}</span>
                                )}
                            </div>
                        </section>
                    )}

                    {step === 3 && (
                        <section className="space-y-4">
                            <h4 className="font-medium">Score & Extras</h4>

                            {/* Score (readonly) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ReadonlyField label="Score de crédito" value={scoreData.credit_score ?? ""} />
                                <ReadonlyField label="Banda de risco" value={scoreData.risk_band ?? ""} />
                                <ReadonlyField label="Status de fraude" value={scoreData.fraud_status ?? ""} />
                            </div>

                            {/* Opcionais */}
                            <div className="flex flex-col">
                                <label className="text-sm mb-1">Finalidade do empréstimo</label>
                                <input
                                    type="text"
                                    className="p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    placeholder="Ex.: Mensalidades, material, moradia…"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm mb-1">Observações</label>
                                <textarea
                                    rows={3}
                                    className="p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    placeholder="Detalhes adicionais relevantes…"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm mb-1">Documentos anexos</label>
                                <label className="flex items-center gap-2 p-2 border border-border rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <Paperclip className="w-4 h-4" />
                                    <span className="text-sm">Selecionar arquivos</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        multiple
                                        onChange={(e) => setFiles(Array.from(e.target.files || []))}
                                    />
                                </label>
                                {files?.length > 0 && (
                                    <span className="text-xs text-gray-500 mt-1">
                                        {files.length} arquivo(s) selecionado(s)
                                    </span>
                                )}
                            </div>
                        </section>
                    )}

                    {step === 4 && (
                        <h1>Obrigada pelo seu cadastro! Agora é só aguardar, estamos buscando investidores para o seu sonho :)</h1>
                    )}
                </div>

                {/* Rodapé com ações */}
                <div className="px-6 pb-6 flex items-center justify-between">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-md border border-border hover:bg-gray-50"
                        onClick={close}
                    >
                        Cancelar
                    </button>

                    <div className="flex items-center gap-3">
                        {step > 1 && (
                            <button
                                type="button"
                                className="px-4 py-2 rounded-md border border-border hover:bg-gray-50"
                                onClick={goPrev}
                            >
                                Anterior
                            </button>
                        )}
                        {step <= 3 ? (
                            <button
                                type="button"
                                onClick={goNext}
                                className="px-4 py-2 rounded-md text-white bg-[var(--primary)] hover:opacity-90"
                            >
                                Próximo
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-md text-white bg-[var(--primary)] hover:opacity-90"
                            >
                                Enviar
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

/* ------------------------ SUB-COMPONENTES ------------------------ */

function InstitutionSelect({ value, onChange, options }) {
    const opts = (options || []).map((o) => ({ id: o.id, name: o.name || String(o.id) }));
    return (
        <Listbox value={value} onChange={onChange}>
            <div className="relative w-full">
                <Listbox.Button className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-gray-800 flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
                    <span>{value?.name ?? "Selecione a instituição"}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </Listbox.Button>
                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 -translate-y-1">
                    <Listbox.Options className="absolute z-50 mt-1 w-full bg-white border border-border rounded-xl shadow-xl py-1 max-h-60 overflow-auto">
                        {opts.map((opt) => (
                            <Listbox.Option
                                key={opt.id}
                                value={opt}
                                className={({ active }) =>
                                    [
                                        "cursor-pointer select-none text-sm px-3 py-2 mx-1 rounded-lg",
                                        active ? "bg-[var(--primary)] text-white" : "text-gray-800 hover:bg-gray-50",
                                    ].join(" ")
                                }
                            >
                                {({ selected }) => (
                                    <div className="flex items-center justify-between">
                                        <span className={selected ? "font-medium" : "font-normal"}>{opt.name}</span>
                                        {selected && <Check className="w-4 h-4" />}
                                    </div>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );
}

function ReadonlyField({ label, value }) {
    return (
        <div className="flex flex-col">
            <label className="text-sm mb-1">{label}</label>
            <input
                type="text"
                readOnly
                value={value ?? ""}
                className="p-2 border border-border rounded-lg bg-gray-50 text-gray-700"
            />
        </div>
    );
}

function StepDot({ active, label }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${active ? "bg-[var(--primary)]" : "bg-gray-300"}`} />
            <span className={`text-xs ${active ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
        </div>
    );
}
