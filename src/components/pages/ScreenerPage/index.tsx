
import React, { Suspense, lazy } from 'react';
import type { AppStep, Candidate, HardFilters, WeightCriteria } from '../../../types';
import JDInput from '../../modules/JDInput';

// Lazy load heavy components
const WeightsConfig = lazy(() => import('../../modules/WeightsConfig'));
const CVUpload = lazy(() => import('../../modules/CVUpload'));
const AnalysisResults = lazy(() => import('../../modules/AnalysisResults'));

// Loading component
const ModuleLoader = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);


interface ScreenerPageProps {
  jdText: string;
  setJdText: React.Dispatch<React.SetStateAction<string>>;
  jobPosition: string;
  setJobPosition: React.Dispatch<React.SetStateAction<string>>;
  weights: WeightCriteria;
  setWeights: React.Dispatch<React.SetStateAction<WeightCriteria>>;
  hardFilters: HardFilters;
  setHardFilters: React.Dispatch<React.SetStateAction<HardFilters>>;
  cvFiles: File[];
  setCvFiles: React.Dispatch<React.SetStateAction<File[]>>;
  analysisResults: Candidate[];
  setAnalysisResults: React.Dispatch<React.SetStateAction<Candidate[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loadingMessage: string;
  setLoadingMessage: React.Dispatch<React.SetStateAction<string>>;
  activeStep: AppStep;
  setActiveStep: (step: AppStep) => void;
  completedSteps: AppStep[];
  markStepAsCompleted: (step: AppStep) => void;
  sidebarCollapsed?: boolean;
  // JD Metadata
  companyName: string;
  setCompanyName: React.Dispatch<React.SetStateAction<string>>;
  salary: string;
  setSalary: React.Dispatch<React.SetStateAction<string>>;
  requirementsSummary: string;
  setRequirementsSummary: React.Dispatch<React.SetStateAction<string>>;
}

const ScreenerPage: React.FC<ScreenerPageProps> = (props) => {
  const { activeStep } = props;

  return (
    <>
      <div className={activeStep === 'jd' ? 'block' : 'hidden'}>
        <JDInput
          jdText={props.jdText}
          setJdText={props.setJdText}
          jobPosition={props.jobPosition}
          setJobPosition={props.setJobPosition}
          hardFilters={props.hardFilters}
          setHardFilters={props.setHardFilters}
          sidebarCollapsed={props.sidebarCollapsed}
          companyName={props.companyName}
          setCompanyName={props.setCompanyName}
          salary={props.salary}
          setSalary={props.setSalary}
          requirementsSummary={props.requirementsSummary}
          setRequirementsSummary={props.setRequirementsSummary}
          onComplete={() => {
            props.markStepAsCompleted('jd');
            props.setActiveStep('weights');
          }}
        />
      </div>
      <div className={activeStep === 'weights' ? 'block' : 'hidden'}>
        <Suspense fallback={<ModuleLoader />}>
          <WeightsConfig
            weights={props.weights}
            setWeights={props.setWeights}
            hardFilters={props.hardFilters}
            setHardFilters={props.setHardFilters}
            onComplete={() => {
              props.markStepAsCompleted('weights');
              props.setActiveStep('upload');
            }}
          />
        </Suspense>
      </div>
      <div className={activeStep === 'upload' ? 'block' : 'hidden'}>
        <Suspense fallback={<ModuleLoader />}>
          <CVUpload
            cvFiles={props.cvFiles}
            setCvFiles={props.setCvFiles}
            jdText={props.jdText}
            weights={props.weights}
            hardFilters={props.hardFilters}
            setAnalysisResults={props.setAnalysisResults}
            setIsLoading={props.setIsLoading}
            setLoadingMessage={props.setLoadingMessage}
            onAnalysisStart={() => {
              props.markStepAsCompleted('upload');
              props.setActiveStep('analysis');
            }}
            completedSteps={props.completedSteps}
          />
        </Suspense>
      </div>
      <div className={activeStep === 'analysis' ? 'block' : 'hidden'}>
        <Suspense fallback={<ModuleLoader />}>
          <AnalysisResults
            isLoading={props.isLoading}
            loadingMessage={props.loadingMessage}
            results={props.analysisResults}
            jobPosition={props.jobPosition}
            locationRequirement={props.hardFilters.location}
            jdText={props.jdText}
            setActiveStep={props.setActiveStep}
            markStepAsCompleted={props.markStepAsCompleted}
          />
        </Suspense>
      </div>
    </>
  );
};

export default ScreenerPage;
