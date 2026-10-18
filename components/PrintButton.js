"use client";

import Icon from "./Icon";

export default function PrintButton() {
  return (
    <button id="btn-imprimir" type="button" className="btn btn-primary" onClick={() => window.print()}>
      <Icon name="printer" size={20} /> Imprimir / Salvar PDF
    </button>
  );
}
