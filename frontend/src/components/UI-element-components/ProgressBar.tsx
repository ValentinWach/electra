import { CheckIcon } from '@heroicons/react/24/solid'
import { useLocation, Link } from "react-router-dom";
import { votePrefix } from '../../constants/PathPrefixes.ts';
import { useEffect, useState } from 'react';
import { useVote } from '../../context/VoteContext';


export default function ProgressBarC() {
    const location = useLocation();
    const { selectedDirectCandidate, selectedParty } = useVote();
    const isOnAuthPage = location.pathname.endsWith('login');
    const hasVoteSelected = selectedDirectCandidate !== null || selectedParty !== null;
    
    const steps = [
        { id: '1', name: 'Authentifizierung', href: `${votePrefix}/authentifizierung` },
        { id: '2', name: 'Wahlzettel', href: `${votePrefix}/wahlzettel` },
        { id: '3', name: 'Bestätigung', href: `${votePrefix}/bestaetigung` },
    ];


    const getStepStatus = (stepIndex: number, currentPath: string) => {
        const currentStep = steps.findIndex(step => currentPath.endsWith(step.href.split('/').pop()!));
        if (currentStep === -1) return 'upcoming';
        return stepIndex < currentStep ? 'complete' : stepIndex === currentStep ? 'current' : 'upcoming';
    };

    const [currentSteps, setCurrentSteps] = useState(
        steps.map((step, index) => ({
            ...step,
            status: getStepStatus(index, location.pathname)
        }))
    );

    useEffect(() => {
        setCurrentSteps(steps.map((step, index) => ({
            ...step,
            status: getStepStatus(index, location.pathname)
        })));
    }, [location.pathname]);

    const renderStep = (step: typeof currentSteps[0], stepIdx: number) => {
        const isFirstStep = stepIdx === 0;
        const isLastStep = stepIdx === steps.length - 1;
        const shouldDisableLinks = isOnAuthPage || isFirstStep || (isLastStep && !hasVoteSelected);

        const content = (
            <span className="flex items-center px-6 py-3 text-sm font-medium">
                {step.status === 'complete' ? (
                    <>
                        <span className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 ${!shouldDisableLinks ? 'group-hover:bg-indigo-800' : ''}`}>
                            <CheckIcon aria-hidden="true" className="size-6 text-white" />
                        </span>
                        <span className="ml-4 text-sm font-medium text-gray-900">{step.name}</span>
                    </>
                ) : step.status === 'current' ? (
                    <>
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-indigo-600">
                            <span className="text-indigo-600">{step.id}</span>
                        </span>
                        <span className="ml-4 text-sm font-medium text-indigo-600">{step.name}</span>
                    </>
                ) : (
                    <>
                        <span className={`flex size-10 shrink-0 items-center justify-center rounded-full border-2 ${!shouldDisableLinks ? 'border-gray-300 group-hover:border-gray-400' : 'border-gray-300'}`}>
                            <span className={`text-gray-500 ${!shouldDisableLinks ? 'group-hover:text-gray-900' : ''}`}>{step.id}</span>
                        </span>
                        <span className={`ml-4 text-sm font-medium text-gray-500 ${!shouldDisableLinks ? 'group-hover:text-gray-900' : ''}`}>{step.name}</span>
                    </>
                )}
            </span>
        );

        if (shouldDisableLinks) {
            return (
                <div className={`flex w-full items-center`}>
                    {content}
                </div>
            );
        }

        return (
            <Link 
                to={step.href}
                className={`flex w-full items-center group`}
                aria-current={step.status === 'current' ? 'step' : undefined}
            >
                {content}
            </Link>
        );
    };

    return (
        <nav aria-label="Progress">
            <ol role="list" className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
                {currentSteps.map((step, stepIdx) => (
                    <li key={step.name} className="relative md:flex md:flex-1">
                        {renderStep(step, stepIdx)}
                        {stepIdx !== currentSteps.length - 1 ? (
                            <>
                                {/* Arrow separator for lg screens and up */}
                                <div aria-hidden="true" className="absolute right-0 top-0 hidden h-full w-5 md:block">
                                    <svg fill="none" viewBox="0 0 22 80" preserveAspectRatio="none" className="size-full text-gray-300">
                                        <path
                                            d="M0 -2L20 40L0 82"
                                            stroke="currentcolor"
                                            vectorEffect="non-scaling-stroke"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </>
                        ) : null}
                    </li>
                ))}
            </ol>
        </nav>
    )
}