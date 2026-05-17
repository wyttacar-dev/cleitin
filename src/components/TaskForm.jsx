import React, { useState } from "react";
import { Plus } from "lucide-react";

export function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState("media");
  const [category, setCategory] = useState("rotina");

  function submit(event) {
    event.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), time, priority, category });
    setTitle("");
    setTime("");
  }

  return (
    <form className="mt-5 grid gap-3 md:grid-cols-[1fr_130px_130px_140px_auto]" onSubmit={submit}>
      <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nova tarefa do dia" />
      <input className="input" type="time" value={time} onChange={(event) => setTime(event.target.value)} aria-label="Horário da tarefa" />
      <select className="input" value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Prioridade">
        <option value="alta">Alta</option>
        <option value="media">Media</option>
        <option value="baixa">Baixa</option>
      </select>
      <select className="input" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Categoria">
        <option value="rotina">Rotina</option>
        <option value="vendas">Vendas</option>
        <option value="marketing">Marketing</option>
        <option value="estudo">Estudo</option>
        <option value="evento">Evento</option>
      </select>
      <button className="soft-button bg-teal-300" type="submit">
        <Plus size={18} />
        Adicionar
      </button>
    </form>
  );
}
