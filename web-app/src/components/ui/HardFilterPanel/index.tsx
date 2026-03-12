import React from "react";
import type { HardFilters } from "../../../types";

interface HardFilterPanelProps {
  hardFilters: HardFilters;
  setHardFilters: React.Dispatch<React.SetStateAction<HardFilters>>;
}

type MandatoryKey = Extract<keyof HardFilters, `${string}Mandatory`>;
type ValueKey = Exclude<keyof HardFilters, MandatoryKey>;

const HardFilterPanel: React.FC<HardFilterPanelProps> = ({
  hardFilters,
  setHardFilters,
}) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;
    setHardFilters((prev) => ({ ...prev, [id]: value }));
  };

  const handleMandatoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setHardFilters((prev) => ({ ...prev, [id]: checked }));
  };

  const hasValue = (val: unknown) => {
    if (typeof val === "string") return val.trim().length > 0;
    return Boolean(val);
  };

  // ── Shared field wrapper ────────────────────────────────────────────────
  const FieldCard = ({
    id,
    mandatoryKey,
    label,
    icon,
    children,
  }: {
    id: string;
    mandatoryKey: MandatoryKey;
    label: string;
    icon: string;
    children: React.ReactNode;
  }) => {
    const isMandatory = Boolean(hardFilters[mandatoryKey]);

    return (
      <div
        className={`group relative rounded-xl border transition-all duration-200 ${
          isMandatory
            ? "border-indigo-500/40 bg-indigo-500/5"
            : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
        }`}
      >
        {/* Mandatory accent bar */}
        {isMandatory && (
          <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-indigo-500" />
        )}

        <div className="px-4 pt-3 pb-3.5 space-y-2.5">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i
                className={`fa-solid ${icon} text-[10px] ${isMandatory ? "text-indigo-400" : "text-slate-600"} transition-colors`}
              />
              <label
                htmlFor={id}
                className={`text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
                  isMandatory ? "text-indigo-300" : "text-slate-500"
                }`}
              >
                {label}
              </label>
            </div>

            {/* Toggle switch */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span
                className={`text-[10px] font-semibold tracking-wide transition-colors ${isMandatory ? "text-indigo-400" : "text-slate-600"}`}
              >
                BẮT BUỘC
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  id={mandatoryKey}
                  checked={isMandatory}
                  onChange={handleMandatoryChange}
                  className="sr-only"
                />
                <div
                  className={`w-8 h-4 rounded-full transition-all duration-200 ${isMandatory ? "bg-indigo-600" : "bg-slate-700"}`}
                />
                <div
                  className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-200 ${isMandatory ? "translate-x-4" : "translate-x-0"}`}
                />
              </div>
            </label>
          </div>

          {/* Input */}
          <div>{children}</div>
        </div>
      </div>
    );
  };

  // ── Shared input/select styles ──────────────────────────────────────────
  const inputBase =
    "w-full h-8 px-3 rounded-lg text-[12.5px] text-slate-200 placeholder-slate-600 bg-slate-800/80 border border-slate-700/60 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800 transition-all";
  const selectBase = `${inputBase} appearance-none cursor-pointer`;

  const SelectField = ({
    id,
    value,
    options,
  }: {
    id: ValueKey;
    value: string;
    options: { value: string; label: string }[];
  }) => (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={handleChange}
        className={selectBase}
      >
        {options.map((o) => (
          <option
            key={o.value || o.label}
            value={o.value}
            className="bg-slate-900"
          >
            {o.label}
          </option>
        ))}
      </select>
      <i className="fa-solid fa-chevron-down text-slate-600 text-[9px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );

  const TextField = ({
    id,
    value,
    placeholder,
  }: {
    id: ValueKey;
    value: string;
    placeholder: string;
  }) => (
    <input
      type="text"
      id={id}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={inputBase}
    />
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* ── Section 1: Điều kiện cơ bản ─────────────────────────────── */}
      <SectionHeader icon="fa-briefcase" label="Điều kiện cơ bản" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldCard
          id="location"
          mandatoryKey="locationMandatory"
          label="Địa điểm"
          icon="fa-location-dot"
        >
          <SelectField
            id="location"
            value={hardFilters.location}
            options={[
              { value: "", label: "Không yêu cầu" },
              { value: "Hà Nội", label: "Hà Nội" },
              { value: "Hải Phòng", label: "Hải Phòng" },
              { value: "Đà Nẵng", label: "Đà Nẵng" },
              { value: "Thành phố Hồ Chí Minh", label: "TP. Hồ Chí Minh" },
              { value: "Remote", label: "Remote" },
            ]}
          />
        </FieldCard>

        <FieldCard
          id="minExp"
          mandatoryKey="minExpMandatory"
          label="Kinh nghiệm tối thiểu"
          icon="fa-clock-rotate-left"
        >
          <SelectField
            id="minExp"
            value={hardFilters.minExp}
            options={[
              { value: "", label: "Không yêu cầu" },
              { value: "1", label: "≥ 1 năm" },
              { value: "2", label: "≥ 2 năm" },
              { value: "3", label: "≥ 3 năm" },
              { value: "5", label: "≥ 5 năm" },
            ]}
          />
        </FieldCard>

        <FieldCard
          id="seniority"
          mandatoryKey="seniorityMandatory"
          label="Cấp bậc & Seniority"
          icon="fa-layer-group"
        >
          <SelectField
            id="seniority"
            value={hardFilters.seniority}
            options={[
              { value: "", label: "Không yêu cầu" },
              { value: "Intern", label: "Intern" },
              { value: "Junior", label: "Junior" },
              { value: "Mid-level", label: "Mid-level" },
              { value: "Senior", label: "Senior" },
              { value: "Lead", label: "Lead" },
            ]}
          />
        </FieldCard>

        <FieldCard
          id="workFormat"
          mandatoryKey="workFormatMandatory"
          label="Hình thức làm việc"
          icon="fa-building"
        >
          <SelectField
            id="workFormat"
            value={hardFilters.workFormat}
            options={[
              { value: "", label: "Không yêu cầu" },
              { value: "Onsite", label: "Onsite" },
              { value: "Hybrid", label: "Hybrid" },
              { value: "Remote", label: "Remote" },
            ]}
          />
        </FieldCard>

        <FieldCard
          id="contractType"
          mandatoryKey="contractTypeMandatory"
          label="Loại hợp đồng"
          icon="fa-file-contract"
        >
          <SelectField
            id="contractType"
            value={hardFilters.contractType}
            options={[
              { value: "", label: "Không yêu cầu" },
              { value: "Full-time", label: "Full-time" },
              { value: "Part-time", label: "Part-time" },
              { value: "Intern", label: "Intern" },
              { value: "Contract", label: "Contract" },
            ]}
          />
        </FieldCard>
      </div>

      {/* ── Section 2: Chuyên môn & Yêu cầu ─────────────────────────── */}
      <SectionHeader icon="fa-graduation-cap" label="Chuyên môn & Yêu cầu" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldCard
          id="industry"
          mandatoryKey="industryMandatory"
          label="Ngành nghề"
          icon="fa-industry"
        >
          <TextField
            id="industry"
            value={hardFilters.industry}
            placeholder="Ví dụ: Fintech, SaaS, E-commerce..."
          />
        </FieldCard>

        <FieldCard
          id="language"
          mandatoryKey="languageMandatory"
          label="Ngôn ngữ"
          icon="fa-language"
        >
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <TextField
              id="language"
              value={hardFilters.language}
              placeholder="Tên ngôn ngữ"
            />
            <div className="relative">
              <select
                id="languageLevel"
                value={hardFilters.languageLevel}
                onChange={handleChange}
                className="h-8 pl-3 pr-7 rounded-lg text-[12px] text-slate-300 bg-slate-800/80 border border-slate-700/60 focus:outline-none focus:border-indigo-500/60 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-slate-900">
                  Mức độ
                </option>
                <option value="B1" className="bg-slate-900">
                  B1
                </option>
                <option value="B2" className="bg-slate-900">
                  B2
                </option>
                <option value="C1" className="bg-slate-900">
                  C1
                </option>
                <option value="C2" className="bg-slate-900">
                  C2
                </option>
              </select>
              <i className="fa-solid fa-chevron-down text-slate-600 text-[8px] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </FieldCard>

        <FieldCard
          id="education"
          mandatoryKey="educationMandatory"
          label="Học vấn"
          icon="fa-user-graduate"
        >
          <SelectField
            id="education"
            value={hardFilters.education}
            options={[
              { value: "", label: "Không yêu cầu" },
              { value: "High School", label: "Tốt nghiệp THPT" },
              { value: "Associate", label: "Cao đẳng" },
              { value: "Bachelor", label: "Cử nhân" },
              { value: "Master", label: "Thạc sĩ" },
              { value: "PhD", label: "Tiến sĩ" },
            ]}
          />
        </FieldCard>

        <FieldCard
          id="certificates"
          mandatoryKey="certificatesMandatory"
          label="Chứng chỉ"
          icon="fa-certificate"
        >
          <TextField
            id="certificates"
            value={hardFilters.certificates}
            placeholder="Ví dụ: PMP, AWS, IELTS..."
          />
        </FieldCard>
      </div>

      {/* ── Section 3: Mức lương ──────────────────────────────────────── */}
      <SectionHeader icon="fa-sack-dollar" label="Mức lương kỳ vọng" />

      <div
        className={`relative rounded-xl border transition-all duration-200 ${
          hardFilters.salaryMandatory
            ? "border-indigo-500/40 bg-indigo-500/5"
            : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
        }`}
      >
        {hardFilters.salaryMandatory && (
          <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-indigo-500" />
        )}
        <div className="px-4 pt-3 pb-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i
                className={`fa-solid fa-coins text-[10px] ${hardFilters.salaryMandatory ? "text-indigo-400" : "text-slate-600"}`}
              />
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider ${hardFilters.salaryMandatory ? "text-indigo-300" : "text-slate-500"}`}
              >
                Khoảng lương (VNĐ)
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span
                className={`text-[10px] font-semibold tracking-wide ${hardFilters.salaryMandatory ? "text-indigo-400" : "text-slate-600"}`}
              >
                BẮT BUỘC
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  id="salaryMandatory"
                  checked={Boolean(hardFilters.salaryMandatory)}
                  onChange={handleMandatoryChange}
                  className="sr-only"
                />
                <div
                  className={`w-8 h-4 rounded-full transition-all duration-200 ${hardFilters.salaryMandatory ? "bg-indigo-600" : "bg-slate-700"}`}
                />
                <div
                  className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-200 ${hardFilters.salaryMandatory ? "translate-x-4" : "translate-x-0"}`}
                />
              </div>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-600 font-medium">Từ</p>
              <input
                type="number"
                id="salaryMin"
                value={hardFilters.salaryMin || ""}
                onChange={handleChange}
                placeholder="0"
                className={inputBase}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-600 font-medium">Đến</p>
              <input
                type="number"
                id="salaryMax"
                value={hardFilters.salaryMax || ""}
                onChange={handleChange}
                placeholder="Không giới hạn"
                className={inputBase}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Section header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon, label }: { icon: string; label: string }) => (
  <div className="flex items-center gap-3 pt-1">
    <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700/60 flex items-center justify-center flex-shrink-0">
      <i className={`fa-solid ${icon} text-slate-400 text-[9px]`} />
    </div>
    <p className="text-[11.5px] font-semibold text-slate-400 uppercase tracking-widest">
      {label}
    </p>
    <div className="flex-1 h-px bg-slate-800" />
  </div>
);

export default HardFilterPanel;
