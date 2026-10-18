"use client";

import Icon from "./Icon";

export default function DeleteButton({ action, confirmText, label = "Excluir" }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <button type="submit" className="btn btn-danger btn-block">
        <Icon name="trash" size={20} /> {label}
      </button>
    </form>
  );
}
