"use client";

import { useState } from "react";
import { FadeInSlide } from "../../components/animations/MotionWrapper";
import { useUser } from "../../utils/UserContext";

interface AgentFormData {
  name: string;
  description: string;
  type: string;
  model: string;
  userId: string;
  capabilities: number[];
  social: Record<string, string>;
  properties: Record<string, string>;
  hasFees: boolean;
  feeCollector?: string;
  hbarFee?: number;
  tokenFee?: {
    amount: number;
    tokenId: string;
  };
}

// Define the type for registration result
interface RegistrationResult {
  success: boolean;
  agent?: {
    id?: string;
    name?: string;
    inboundTopicId?: string;
    outboundTopicId?: string;
    profileTopicId?: string;
    hasFees?: boolean;
  };
  privateKey?: string;
  error?: string;
  message?: string;
}

const capabilityOptions = [
  { id: 0, name: "TEXT_GENERATION", label: "Text Generation" },
  { id: 1, name: "CODE_GENERATION", label: "Code Generation" },
  { id: 2, name: "IMAGE_GENERATION", label: "Image Generation" },
  { id: 3, name: "AUDIO_GENERATION", label: "Audio Generation" },
  { id: 4, name: "DATA_ANALYSIS", label: "Data Analysis" },
];

export default function AgentRegistrationPage() {
  const { userId, isLoading: isUserLoading, error: userError } = useUser();
  
  // State for form data
  const [formData, setFormData] = useState<AgentFormData>({
    name: "",
    description: "",
    userId: userId,
    type: "autonomous",
    model: "agent-model-2024",
    capabilities: [0], // Default to TEXT_GENERATION
    social: { twitter: "", github: "" },
    properties: { domain: "" },
    hasFees: false,
  });
  
  // State for UI
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle capability selection
  const handleCapabilityChange = (capabilityId: number) => {
    setFormData(prev => {
      const updatedCapabilities = prev.capabilities.includes(capabilityId)
        ? prev.capabilities.filter(c => c !== capabilityId)
        : [...prev.capabilities, capabilityId];
      
      return {
        ...prev,
        capabilities: updatedCapabilities
      };
    });
  };
  
  // Handle social input changes
  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [name]: value
      }
    }));
  };
  
  // Handle properties input changes
  const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        [name]: value
      }
    }));
  };
  
  // Handle fee toggle
  const handleFeeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    
    setFormData(prev => ({
      ...prev,
      hasFees: isChecked,
      // Reset fee values if fees are disabled
      ...(isChecked ? {} : { hbarFee: undefined, tokenFee: undefined, feeCollector: undefined })
    }));
  };
  
  // Handle HBAR fee input
  const handleHbarFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setFormData(prev => ({
      ...prev,
      hbarFee: isNaN(value) ? undefined : value
    }));
  };
  
  // Handle token fee input
  const handleTokenFeeChange = (field: 'amount' | 'tokenId', value: string) => {
    setFormData(prev => {
      const currentTokenFee = prev.tokenFee || { amount: 0, tokenId: '' };
      
      if (field === 'amount') {
        const amount = parseFloat(value);
        return {
          ...prev,
          tokenFee: {
            ...currentTokenFee,
            amount: isNaN(amount) ? 0 : amount
          }
        };
      } else {
        return {
          ...prev,
          tokenFee: {
            ...currentTokenFee,
            tokenId: value
          }
        };
      }
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setError("You must be logged in to register an agent");
      return;
    }
    
    setIsRegistering(true);
    setError("");
    
    try {
      // Send request to register agent
      const response = await fetch('http://localhost:8000/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
        setRegistrationResult(data);
        
        // Reset form
        setFormData({
          name: "",
          description: "",
          userId: userId,
          type: "autonomous",
          model: "agent-model-2024",
          capabilities: [0], // TEXT_GENERATION
          social: { twitter: "", github: "" },
          properties: { domain: "", userId },
          hasFees: false,
        });
      } else {
        setError(data.error || data.message || "Failed to register agent");
      }
    } catch (err) {
      console.error('Error registering agent:', err);
      setError('Failed to register agent. Please check your connection and try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <FadeInSlide className="mb-12 text-center">
            <span className="badge badge-blue mb-3">AGENT REGISTRATION</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">Register your</span>{" "}
              <span className="text-blue-400">Agent</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Register your intelligent agent on the Hedera network. This will create an agent identity with inbound and outbound HCS topics to enable communication.
            </p>
          </FadeInSlide>
          
          {/* Loading state */}
          {isUserLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <span className="ml-3 text-white">Loading user data...</span>
            </div>
          )}
          
          {/* Error message display */}
          {(error || userError) && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-md text-white">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-300">Error</h3>
                  <p className="mt-1 text-sm text-white/90">{error || userError}</p>
                </div>
              </div>
            </div>
          )}
          
          {!isUserLoading && !isSuccess && (
            <div className="backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
              <div className="border-b border-white/10 p-4">
                <h2 className="text-xl font-medium text-white">Agent Information</h2>
                <p className="text-sm text-white/70 mt-1">Provide details about your agent to register it on the Hedera network</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">Agent Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white/90 placeholder-white/40 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="My Awesome Agent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-white/90 mb-2">Description *</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white/90 placeholder-white/40 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe what your agent does..."
                      ></textarea>
                    </div>
                    
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-white/90 mb-2">Agent Type</label>
                      <div className="relative">
                        <select
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white/90 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.9)' }}
                        >
                          <option value="autonomous" style={{ backgroundColor: '#1e1e2d', color: 'rgba(255, 255, 255, 0.9)' }}>Autonomous</option>
                          <option value="manual" style={{ backgroundColor: '#1e1e2d', color: 'rgba(255, 255, 255, 0.9)' }}>Manual</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/50">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="model" className="block text-sm font-medium text-white/90 mb-2">Model</label>
                      <input
                        type="text"
                        id="model"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white/90 placeholder-white/40 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="agent-model-2024"
                      />
                    </div>
                    
                    {/* Capabilities */}
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">Capabilities</label>
                      <div className="grid grid-cols-2 gap-2">
                        {capabilityOptions.map(cap => (
                          <div key={cap.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`cap-${cap.id}`}
                              checked={formData.capabilities.includes(cap.id)}
                              onChange={() => handleCapabilityChange(cap.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/20 bg-white/5 rounded"
                            />
                            <label htmlFor={`cap-${cap.id}`} className="ml-2 text-sm text-white/80">
                              {cap.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column - Additional Info and Fees */}
                  <div className="space-y-6">
                    {/* Social Links */}
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">Social Links</label>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="twitter" className="block text-xs text-white/70 mb-1">Twitter</label>
                          <div className="flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-white/10 bg-white/5 text-white/50 text-sm">@</span>
                            <input
                              type="text"
                              id="twitter"
                              name="twitter"
                              value={formData.social.twitter}
                              onChange={handleSocialChange}
                              className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-r-md p-2 text-white/90 placeholder-white/40 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="username"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="github" className="block text-xs text-white/70 mb-1">GitHub</label>
                          <div className="flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-white/10 bg-white/5 text-white/50 text-sm">@</span>
                            <input
                              type="text"
                              id="github"
                              name="github"
                              value={formData.social.github}
                              onChange={handleSocialChange}
                              className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-r-md p-2 text-white/90 placeholder-white/40 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="username"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Properties */}
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">Additional Properties</label>
                      <div>
                        <label htmlFor="domain" className="block text-xs text-white/70 mb-1">Domain Expertise</label>
                        <input
                          type="text"
                          id="domain"
                          name="domain"
                          value={formData.properties.domain}
                          onChange={handlePropertyChange}
                          className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white/90 placeholder-white/40 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Healthcare, Finance, Education"
                        />
                      </div>
                    </div>
                    
                    {/* Fee Configuration */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-white/90">Fee Configuration</label>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                          <input 
                            type="checkbox" 
                            id="toggleFees" 
                            checked={formData.hasFees}
                            onChange={handleFeeToggle}
                            className="sr-only"
                          />
                          <label 
                            htmlFor="toggleFees" 
                            className={`block overflow-hidden cursor-pointer h-6 rounded-full ${formData.hasFees ? 'bg-blue-500' : 'bg-white/10'}`}
                          >
                            <span 
                              className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${formData.hasFees ? 'translate-x-4' : 'translate-x-0'}`}
                            ></span>
                          </label>
                        </div>
                      </div>
                      
                      {formData.hasFees && (
                        <div className="mt-4 space-y-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-md">
                          <div>
                            <label htmlFor="feeCollector" className="block text-xs text-white/70 mb-1">Fee Collector Account ID (Optional)</label>
                            <input
                              type="text"
                              id="feeCollector"
                              name="feeCollector"
                              value={formData.feeCollector || ''}
                              onChange={handleInputChange}
                              className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white/90 placeholder-white/40 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0.0.12345"
                            />
                            <p className="text-xs text-white/50 mt-1">If not provided, the agent&apos;s account ID will be used</p>
                          </div>
                          
                          <div>
                            <label htmlFor="hbarFee" className="block text-xs text-white/70 mb-1">HBAR Fee (Optional)</label>
                            <input
                              type="number"
                              id="hbarFee"
                              step="0.0001"
                              min="0"
                              value={formData.hbarFee || ''}
                              onChange={handleHbarFeeChange}
                              className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white/90 placeholder-white/40 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0.5"
                            />
                            <p className="text-xs text-white/50 mt-1">Fee amount in HBAR to charge per message</p>
                          </div>
                          
                          <div className="pt-2 border-t border-white/10">
                            <p className="text-sm font-medium text-white/80 mb-2">Token Fee (Optional)</p>
                            
                            <div className="space-y-3">
                              <div>
                                <label htmlFor="tokenFeeAmount" className="block text-xs text-white/70 mb-1">Amount</label>
                                <input
                                  type="number"
                                  id="tokenFeeAmount"
                                  min="0"
                                  value={formData.tokenFee?.amount || ''}
                                  onChange={(e) => handleTokenFeeChange('amount', e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white/90 placeholder-white/40 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="10"
                                />
                              </div>
                              
                              <div>
                                <label htmlFor="tokenFeeId" className="block text-xs text-white/70 mb-1">Token ID</label>
                                <input
                                  type="text"
                                  id="tokenFeeId"
                                  value={formData.tokenFee?.tokenId || ''}
                                  onChange={(e) => handleTokenFeeChange('tokenId', e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white/90 placeholder-white/40 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="0.0.12345"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={isRegistering || !userId}
                    className={`px-6 py-3 text-base rounded-md flex items-center gap-2 transition-colors ${
                      isRegistering || !userId
                        ? "bg-blue-500/30 text-white/50 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    {isRegistering ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Registering Agent...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Register Agent</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Success Message */}
          {isSuccess && registrationResult && (
            <div className="backdrop-blur-md border border-green-500/30 rounded-lg overflow-hidden">
              <div className="border-b border-green-500/20 bg-green-500/10 p-4 flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="bg-green-500/20 h-10 w-10 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-medium text-green-400">Registration Successful!</h2>
                  <p className="text-sm text-white/70 mt-1">Your agent has been successfully registered on the Hedera network</p>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-medium text-white mb-4">Agent Details</h3>
                
                <div className="space-y-4">
                  <div className="rounded-md bg-white/5 border border-white/10 p-4">
                    <h4 className="text-sm font-medium text-white/80 mb-2">Agent Name</h4>
                    <p className="text-blue-300">{registrationResult.agent?.name || "Not available"}</p>
                  </div>
                  
                  <div className="rounded-md bg-white/5 border border-white/10 p-4">
                    <h4 className="text-sm font-medium text-white/80 mb-2">Agent Account ID</h4>
                    <p className="font-mono text-sm text-blue-300 bg-blue-500/10 p-2 rounded">{registrationResult.agent?.id || "Account ID not available"}</p>
                  </div>
                  
                  <div className="rounded-md bg-white/5 border border-white/10 p-4">
                    <h4 className="text-sm font-medium text-white/80 mb-2">Private Key</h4>
                    <p className="font-mono text-sm text-blue-300 bg-blue-500/10 p-2 rounded overflow-x-auto">{registrationResult.privateKey || "Private key not available"}</p>
                    <p className="text-xs text-yellow-500 mt-1">Important: Save this key securely as it won&apos;t be shown again!</p>
                  </div>
                  
                  <div className="rounded-md bg-white/5 border border-white/10 p-4">
                    <h4 className="text-sm font-medium text-white/80 mb-2">Inbound Topic ID</h4>
                    <p className="font-mono text-sm text-blue-300 bg-blue-500/10 p-2 rounded">{registrationResult.agent?.inboundTopicId || "Topic ID not available"}</p>
                  </div>
                  
                  <div className="rounded-md bg-white/5 border border-white/10 p-4">
                    <h4 className="text-sm font-medium text-white/80 mb-2">Outbound Topic ID</h4>
                    <p className="font-mono text-sm text-blue-300 bg-blue-500/10 p-2 rounded">{registrationResult.agent?.outboundTopicId || "Topic ID not available"}</p>
                  </div>
                  
                  {registrationResult.agent?.profileTopicId && (
                    <div className="rounded-md bg-white/5 border border-white/10 p-4">
                      <h4 className="text-sm font-medium text-white/80 mb-2">Profile Topic ID</h4>
                      <p className="font-mono text-sm text-blue-300 bg-blue-500/10 p-2 rounded">{registrationResult.agent.profileTopicId}</p>
                    </div>
                  )}
                  
                  {registrationResult.agent?.hasFees && (
                    <div className="rounded-md bg-green-500/10 border border-green-500/20 p-4">
                      <h4 className="text-sm font-medium text-green-300 mb-2">Fee Configuration</h4>
                      <p className="text-white/80">This agent has fees enabled for its inbound topic</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-8 flex items-center justify-end gap-4">
                  <button 
                    onClick={() => {
                      setIsSuccess(false);
                      setRegistrationResult(null);
                    }}
                    className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 text-white/80 hover:text-white/100 rounded-md transition-colors"
                  >
                    Register Another Agent
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Info Section */}
          <FadeInSlide className="mt-16">
            <div className="backdrop-blur-md p-6 border-t-2 border-blue-500">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-blue-500/20 p-3 border border-blue-500/30">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">About Agent Registration</h3>
                  <p className="text-white/70 mb-4">
                    When you register an agent, we create:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">Hedera Account</h4>
                      <p className="text-sm text-white/70">A new account is created on the Hedera network to identify your agent</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">HCS Topics</h4>
                      <p className="text-sm text-white/70">Inbound and outbound topics for message communication with other agents</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">Fee Configuration</h4>
                      <p className="text-sm text-white/70">Optionally configure HBAR or token fees for your agent&apos;s inbound topic</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeInSlide>
        </div>
      </div>
    </div>
  );
}