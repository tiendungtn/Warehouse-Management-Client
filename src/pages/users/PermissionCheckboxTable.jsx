import { Check, Minus } from "lucide-react";

export default function PermissionCheckboxTable({
  groups,
  selectedPermissions,
  onToggle,
  disabled = false,
}) {
  const selected = new Set(selectedPermissions);

  const toggleGroup = (items, checked) => {
    for (const [code] of items) {
      if (selected.has(code) !== checked) {
        onToggle(code, checked);
      }
    }
  };

  return (
    <div className="permission-matrix">
      {groups.map((group) => {
        const groupCodes = group.items.map(([code]) => code);
        const selectedCount = groupCodes.filter((code) =>
          selected.has(code),
        ).length;
        const allSelected =
          groupCodes.length > 0 && selectedCount === groupCodes.length;

        return (
          <section className="permission-matrix-group" key={group.name}>
            <div className="permission-matrix-group-heading">
              <div>
                <h4>{group.name}</h4>
                <span>
                  {selectedCount}/{groupCodes.length} quyền
                </span>
              </div>

              <button
                type="button"
                className="permission-select-group"
                disabled={disabled}
                onClick={() => toggleGroup(group.items, !allSelected)}
              >
                {allSelected ? (
                  <>
                    <Minus size={14} />
                    Bỏ chọn nhóm
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    Chọn cả nhóm
                  </>
                )}
              </button>
            </div>

            <div className="permission-matrix-table-wrap">
              <table className="permission-matrix-table">
                <thead>
                  <tr>
                    <th>Quyền</th>
                    <th>Mã quyền</th>
                    <th className="permission-checkbox-column">Cấp quyền</th>
                  </tr>
                </thead>

                <tbody>
                  {group.items.map(([code, label]) => (
                    <tr key={code}>
                      <td>
                        <label
                          className="permission-checkbox-label"
                          htmlFor={`permission-${code.replaceAll(".", "-")}`}
                        >
                          {label}
                        </label>
                      </td>

                      <td>
                        <code className="permission-code">{code}</code>
                      </td>

                      <td className="permission-checkbox-column">
                        <input
                          id={`permission-${code.replaceAll(".", "-")}`}
                          type="checkbox"
                          checked={selected.has(code)}
                          disabled={disabled}
                          aria-label={`${label} (${code})`}
                          onChange={(event) =>
                            onToggle(code, event.target.checked)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
