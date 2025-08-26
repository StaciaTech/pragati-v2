
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, Loader } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface StepperContextValue extends StepperProps {
  activeStep: number
  isLastStep: boolean
  isFirstStep: boolean
  isVertical: boolean
  goToNextStep: () => void
  goToPreviousStep: () => void
  setStep: (step: number) => void
}

const StepperContext = React.createContext<StepperContextValue | null>(null)

export function useStepper() {
  const context = React.useContext(StepperContext)
  if (!context) {
    throw new Error("useStepper must be used within a <Stepper />")
  }
  return context
}

const stepperVariants = cva(
  "flex w-full flex-wrap justify-between gap-2",
  {
    variants: {
      orientation: {
        horizontal: "flex-row",
        vertical: "flex-col",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

interface StepperProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stepperVariants> {
  initialStep?: number
  activeStep?: number
  onStepClick?: (step: number) => void
  children: React.ReactNode
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      className,
      children,
      orientation = "horizontal",
      initialStep = 0,
      activeStep: activeStepProp,
      onStepClick,
      ...props
    },
    ref
  ) => {
    const isVertical = orientation === "vertical"
    const [localActiveStep, setLocalActiveStep] = React.useState(initialStep)

    const activeStep = activeStepProp !== undefined ? activeStepProp : localActiveStep;

    const stepCount = React.Children.toArray(children).length
    const isLastStep = activeStep === stepCount - 1
    const isFirstStep = activeStep === 0

    const setStep = (step: number) => {
      if (onStepClick) {
        onStepClick(step)
      } else {
        setLocalActiveStep(step)
      }
    }

    const goToNextStep = () => {
        if (!isLastStep) {
            setStep(activeStep + 1);
        }
    }
    
    const goToPreviousStep = () => {
        if (!isFirstStep) {
            setStep(activeStep - 1);
        }
    }


    const contextValue: StepperContextValue = {
      isVertical,
      activeStep,
      isLastStep,
      isFirstStep,
      stepCount,
      goToNextStep,
      goToPreviousStep,
      setStep,
      ...props,
    }

    return (
      <StepperContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            "stepper-main-container",
            "flex w-full flex-wrap justify-between gap-4",
            isVertical ? "flex-col" : "flex-row",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </StepperContext.Provider>
    )
  }
)
Stepper.displayName = "Stepper"

const StepperItem = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode
    index: number
    isCompleted?: boolean
    isCurrent?: boolean
    isError?: boolean
    isLoading?: boolean
  }
>(
  (
    { children, index, isCompleted, isCurrent, isError, isLoading },
    ref
  ) => {
    const { activeStep, isVertical } = useStepper()
    const isItemCurrent = isCurrent ?? activeStep === index
    const isItemCompleted = isCompleted ?? activeStep > index

    return (
      <div
        ref={ref}
        className={cn(
          "stepper-item-container",
          "flex-1 flex items-start gap-4",
          isVertical ? "flex-col" : "",
        )}
        data-completed={isItemCompleted}
        data-current={isItemCurrent}
      >
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<any>, {
                index,
                isCompleted: isItemCompleted,
                isCurrent: isItemCurrent,
                isError,
                isLoading,
              })
            : child
        )}
      </div>
    )
  }
)
StepperItem.displayName = "StepperItem"

const StepperTrigger = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode
    index?: number
    isCompleted?: boolean
    isCurrent?: boolean
    isError?: boolean
    isLoading?: boolean
  }
>(
  (
    {
      children,
      index,
      isCompleted,
      isCurrent,
      isError,
      isLoading,
    },
    ref
  ) => {
    const { setStep, isVertical } = useStepper()
    
    const hasError = isError && isCurrent

    return (
      <div
        ref={ref}
        className={cn(
          "stepper-trigger-container",
          "flex items-center gap-4 cursor-pointer",
           isVertical ? "w-full" : ""
        )}
        onClick={() => index !== undefined && setStep(index)}
      >
        <div
          className={cn(
            "stepper-icon-container",
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors",
            isCurrent && "border-primary",
            isCompleted && "bg-primary border-primary text-primary-foreground",
            hasError && "border-destructive text-destructive"
          )}
        >
          {isLoading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : isCompleted ? (
            <Check className="w-5 h-5" />
          ) : (
            <span
              className={cn(
                "stepper-index-text",
                 isCurrent && "text-primary",
                 hasError && "text-destructive"
              )}
            >
              {index !== undefined && index + 1}
            </span>
          )}
        </div>
        <div className={cn("stepper-trigger-content", isVertical ? "flex flex-col" : "hidden md:block")}>
          {children}
        </div>
      </div>
    )
  }
)
StepperTrigger.displayName = "StepperTrigger"

const StepperContent = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode }
>(({ children }, ref) => {
  const { activeStep, isVertical } = useStepper()

  return (
    <div
      ref={ref}
      className={cn(
        "stepper-content-container",
        "w-full p-4 border-l-2 ml-4 transition-all duration-300",
        isVertical ? "mt-2" : "mt-4 md:ml-0 md:pl-0 md:border-l-0 md:border-t-2"
      )}
    >
      {children}
    </div>
  )
})
StepperContent.displayName = "StepperContent"

const StepperNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>((props, ref) => {
  const { goToNextStep, isLastStep } = useStepper()
  return (
    <Button
      ref={ref}
      onClick={goToNextStep}
      disabled={isLastStep}
      {...props}
    >
      Next
    </Button>
  )
})
StepperNext.displayName = "StepperNext"

const StepperPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>((props, ref) => {
  const { goToPreviousStep, isFirstStep } = useStepper()
  return (
    <Button
      ref={ref}
      variant="outline"
      onClick={goToPreviousStep}
      disabled={isFirstStep}
      {...props}
    >
      Previous
    </Button>
  )
})
StepperPrevious.displayName = "StepperPrevious"

export {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperContent,
  StepperNext,
  StepperPrevious,
}
