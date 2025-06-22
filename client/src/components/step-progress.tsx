interface StepProgressProps {
  currentStep: number;
}

export default function StepProgress({ currentStep }: StepProgressProps) {
  const steps = [
    { number: 1, label: "Project Input" },
    { number: 2, label: "Configuration" },
    { number: 3, label: "Templates" },
    { number: 4, label: "Deploy" },
  ];

  return (
    <div className="flex items-center justify-center space-x-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step.number <= currentStep
                  ? "bg-primary text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {step.number}
            </div>
            <span
              className={`ml-3 text-sm font-medium ${
                step.number <= currentStep ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="w-16 h-0.5 bg-gray-300 ml-8"></div>
          )}
        </div>
      ))}
    </div>
  );
}
