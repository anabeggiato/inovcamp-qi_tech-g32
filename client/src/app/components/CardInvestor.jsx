import React from "react";

export default function CardInvestor({
  title,
  min_sugestion,
  max_sugestion,
  min_students,
  max_students,
  min_return,
  max_return,
  min_score,
  max_score,
  risk,
}) {
  // helpers pra lidar com valores que terminam em "+"
  const renderMoneyRange = () =>
    max_sugestion === "+"
      ? `R$ ${min_sugestion}+`
      : `R$ ${min_sugestion} - R$ ${max_sugestion}`;

  const renderStudentsRange = () =>
    max_students === "+"
      ? `${min_students}+ estudantes`
      : `${min_students}-${max_students} estudantes`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 md:p-8 w-[80%]">
      <h3 className="text-2xl font-bold text-center text-slate-900 mb-6">
        {title}
      </h3>

      <div className="space-y-5">
        <div>
          <p className="text-sm text-slate-500">Investimento Sugerido</p>
          <span className="block font-semibold text-slate-900">
            {renderMoneyRange()}
          </span>
        </div>

        <div>
          <p className="text-sm text-slate-500">Diversificação</p>
          <span className="block font-semibold text-slate-900">
            {renderStudentsRange()}
          </span>
        </div>

        <div>
          <p className="text-sm text-slate-500">Retorno Esperado</p>
          <span className="block font-semibold text-emerald-600">
            {min_return}-{max_return}% a.a.
          </span>
        </div>

        <div>
          <p className="text-sm text-slate-500">Score Mínimo</p>
          <span className="block font-semibold text-slate-900">
            {min_score} ou {max_score}
          </span>
        </div>

        <div>
          <p className="text-sm text-slate-500">Nível de Risco</p>
          <span className="block font-semibold text-slate-900">{risk}</span>
        </div>
      </div>
    </div>
  );
}
