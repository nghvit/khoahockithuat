import React, { useMemo } from 'react';
import type { HardFilters } from '../../../types';

interface HardFilterPanelProps {
    hardFilters: HardFilters;
    setHardFilters: React.Dispatch<React.SetStateAction<HardFilters>>;
}

type MandatoryKey = Extract<keyof HardFilters, `${string}Mandatory`>;
type ValueKey = Exclude<keyof HardFilters, MandatoryKey>;

const HardFilterPanel: React.FC<HardFilterPanelProps> = ({ hardFilters, setHardFilters }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setHardFilters((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleMandatoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, checked } = e.target;
        setHardFilters((prev) => ({
            ...prev,
            [id]: checked,
        }));
    };

    const hasValue = (val: unknown) => {
        if (typeof val === 'string') return val.trim().length > 0;
        return Boolean(val);
    };

    const inputClasses = (isMandatory: boolean, valuePresent: boolean) =>
        `w-full bg-transparent border-0 border-b py-2 text-sm text-slate-200 placeholder-slate-700 transition-all focus:outline-none focus:ring-0 ${isMandatory
            ? valuePresent
                ? 'border-cyan-500/40 focus:border-cyan-400 shadow-[0_1px_0_0_rgba(6,182,212,0.1)]'
                : 'border-red-500/40 focus:border-red-400'
            : 'border-slate-800 focus:border-slate-600'
        }`;

    const selectFieldConfigs: Array<{
        id: ValueKey;
        label: string;
        placeholder: string;
        mandatoryKey: MandatoryKey;
        options: { value: string; label: string }[];
    }> = [
            {
                id: 'location',
                label: 'Địa điểm làm việc',
                placeholder: 'Chọn địa điểm',
                mandatoryKey: 'locationMandatory',
                options: [
                    { value: '', label: 'Chọn địa điểm' },
                    { value: 'Hà Nội', label: 'Hà Nội' },
                    { value: 'Hải Phòng', label: 'Hải Phòng' },
                    { value: 'Đà Nẵng', label: 'Đà Nẵng' },
                    { value: 'Thành phố Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
                    { value: 'Remote', label: 'Remote' },
                ],
            },
            {
                id: 'minExp',
                label: 'Kinh nghiệm tối thiểu',
                placeholder: 'Không yêu cầu',
                mandatoryKey: 'minExpMandatory',
                options: [
                    { value: '', label: 'Không yêu cầu' },
                    { value: '1', label: '≥ 1 năm' },
                    { value: '2', label: '≥ 2 năm' },
                    { value: '3', label: '≥ 3 năm' },
                    { value: '5', label: '≥ 5 năm' },
                ],
            },
            {
                id: 'seniority',
                label: 'Cấp bậc & Seniority',
                placeholder: 'Không yêu cầu',
                mandatoryKey: 'seniorityMandatory',
                options: [
                    { value: '', label: 'Không yêu cầu' },
                    { value: 'Intern', label: 'Intern' },
                    { value: 'Junior', label: 'Junior' },
                    { value: 'Mid-level', label: 'Mid-level' },
                    { value: 'Senior', label: 'Senior' },
                    { value: 'Lead', label: 'Lead' },
                ],
            },
            {
                id: 'workFormat',
                label: 'Hình thức làm việc',
                placeholder: 'Không yêu cầu',
                mandatoryKey: 'workFormatMandatory',
                options: [
                    { value: '', label: 'Không yêu cầu' },
                    { value: 'Onsite', label: 'Onsite' },
                    { value: 'Hybrid', label: 'Hybrid' },
                    { value: 'Remote', label: 'Remote' },
                ],
            },
            {
                id: 'contractType',
                label: 'Loại hợp đồng',
                placeholder: 'Không yêu cầu',
                mandatoryKey: 'contractTypeMandatory',
                options: [
                    { value: '', label: 'Không yêu cầu' },
                    { value: 'Full-time', label: 'Full-time' },
                    { value: 'Part-time', label: 'Part-time' },
                    { value: 'Intern', label: 'Intern' },
                    { value: 'Contract', label: 'Contract' },
                ],
            },
        ];

    const renderCompactField = (config: (typeof selectFieldConfigs)[number]) => {
        const isMandatory = hardFilters[config.mandatoryKey];
        const hasCurrentValue = hasValue(hardFilters[config.id]);

        return (
            <div key={config.id} className="flex flex-col group mt-4">
                <div className="flex items-center justify-between mb-1">
                    <label htmlFor={config.id} className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                        {config.label}
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id={config.mandatoryKey}
                            checked={Boolean(isMandatory)}
                            onChange={handleMandatoryChange}
                            className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900/50 text-cyan-500 focus:ring-0 transition-colors"
                        />
                        <label htmlFor={config.mandatoryKey} className={`text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-colors ${isMandatory ? 'text-cyan-400' : 'text-slate-600 hover:text-slate-400'}`}>
                            Bắt buộc
                        </label>
                    </div>
                </div>
                <select
                    id={config.id}
                    value={hardFilters[config.id]}
                    onChange={handleChange}
                    className={inputClasses(Boolean(isMandatory), hasCurrentValue)}
                >
                    {config.options.map((option) => (
                        <option key={option.value ?? option.label} value={option.value} className="bg-slate-900">
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Group 1: Basic Info */}
            <div className="flex flex-col">
                <h5 className="text-[11px] font-bold text-cyan-400 uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-cyan-500/30"></span>
                    Điều kiện cơ bản
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {selectFieldConfigs.map(renderCompactField)}
                </div>
            </div>

            {/* Group 2: Context & Quality */}
            <div className="flex flex-col">
                <h5 className="text-[11px] font-bold text-cyan-400 uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-cyan-500/30"></span>
                    Chuyên môn & Yêu cầu
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    {/* Industry */}
                    <div className="flex flex-col group">
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="industry" className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 group-focus-within:text-cyan-400 transition-colors">Ngành nghề</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="industryMandatory"
                                    checked={hardFilters.industryMandatory}
                                    onChange={handleMandatoryChange}
                                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900/50 text-cyan-500 focus:ring-0"
                                />
                                <label htmlFor="industryMandatory" className={`text-[10px] uppercase font-bold tracking-wider cursor-pointer ${hardFilters.industryMandatory ? 'text-cyan-400' : 'text-slate-600'}`}>Bắt buộc</label>
                            </div>
                        </div>
                        <input
                            type="text"
                            id="industry"
                            value={hardFilters.industry}
                            onChange={handleChange}
                            placeholder="Ví dụ: Fintech, SaaS..."
                            className={inputClasses(hardFilters.industryMandatory, hasValue(hardFilters.industry))}
                        />
                    </div>

                    {/* Language */}
                    <div className="flex flex-col group">
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="language" className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 group-focus-within:text-cyan-400 transition-colors">Ngôn ngữ</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="languageMandatory"
                                    checked={hardFilters.languageMandatory}
                                    onChange={handleMandatoryChange}
                                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900/50 text-cyan-500 focus:ring-0"
                                />
                                <label htmlFor="languageMandatory" className={`text-[10px] uppercase font-bold tracking-wider cursor-pointer ${hardFilters.languageMandatory ? 'text-cyan-400' : 'text-slate-600'}`}>Bắt buộc</label>
                            </div>
                        </div>
                        <div className="grid grid-cols-[2fr_1fr] gap-4">
                            <input
                                type="text"
                                id="language"
                                value={hardFilters.language}
                                onChange={handleChange}
                                placeholder="Tên ngôn ngữ"
                                className={inputClasses(hardFilters.languageMandatory, hasValue(hardFilters.language))}
                            />
                            <select
                                id="languageLevel"
                                value={hardFilters.languageLevel}
                                onChange={handleChange}
                                className={inputClasses(false, hasValue(hardFilters.languageLevel))}
                            >
                                <option value="" className="bg-slate-900">Mức độ</option>
                                <option value="B1" className="bg-slate-900">B1</option>
                                <option value="B2" className="bg-slate-900">B2</option>
                                <option value="C1" className="bg-slate-900">C1</option>
                                <option value="C2" className="bg-slate-900">C2</option>
                            </select>
                        </div>
                    </div>

                    {/* Education */}
                    <div className="flex flex-col group">
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="education" className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 group-focus-within:text-cyan-400 transition-colors">Học vấn</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="educationMandatory"
                                    checked={hardFilters.educationMandatory}
                                    onChange={handleMandatoryChange}
                                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900/50 text-cyan-500 focus:ring-0"
                                />
                                <label htmlFor="educationMandatory" className={`text-[10px] uppercase font-bold tracking-wider cursor-pointer ${hardFilters.educationMandatory ? 'text-cyan-400' : 'text-slate-600'}`}>Bắt buộc</label>
                            </div>
                        </div>
                        <select
                            id="education"
                            value={hardFilters.education}
                            onChange={handleChange}
                            className={inputClasses(hardFilters.educationMandatory, hasValue(hardFilters.education))}
                        >
                            <option value="" className="bg-slate-900">Không yêu cầu</option>
                            <option value="High School" className="bg-slate-900">Tốt nghiệp THPT</option>
                            <option value="Associate" className="bg-slate-900">Cao đẳng</option>
                            <option value="Bachelor" className="bg-slate-900">Cử nhân</option>
                            <option value="Master" className="bg-slate-900">Thạc sĩ</option>
                            <option value="PhD" className="bg-slate-900">Tiến sĩ</option>
                        </select>
                    </div>

                    {/* Certificates */}
                    <div className="flex flex-col group">
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="certificates" className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 group-focus-within:text-cyan-400 transition-colors">Chứng chỉ</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="certificatesMandatory"
                                    checked={hardFilters.certificatesMandatory}
                                    onChange={handleMandatoryChange}
                                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900/50 text-cyan-500 focus:ring-0"
                                />
                                <label htmlFor="certificatesMandatory" className={`text-[10px] uppercase font-bold tracking-wider cursor-pointer ${hardFilters.certificatesMandatory ? 'text-cyan-400' : 'text-slate-600'}`}>Bắt buộc</label>
                            </div>
                        </div>
                        <input
                            type="text"
                            id="certificates"
                            value={hardFilters.certificates}
                            onChange={handleChange}
                            placeholder="Ví dụ: PMP, AWS, IELTS..."
                            className={inputClasses(hardFilters.certificatesMandatory, hasValue(hardFilters.certificates))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HardFilterPanel;
