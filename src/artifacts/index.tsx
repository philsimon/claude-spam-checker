import React, { useState } from 'react';
import { AlertTriangle, Shield, Info, ChevronDown, ChevronUp, Mail, Link, User, FileText, TrendingUp } from 'lucide-react';

const SpamAnalyzer = () => {
  const [emailText, setEmailText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    sender: true,
    content: true,
    recommendations: true
  });

  const analyzeEmail = async () => {
    if (!emailText.trim()) return;
    
    setAnalyzing(true);
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Analyze this email for spam, phishing, or fraud patterns. Provide your response in the following JSON format:

{
  "riskLevel": "Critical|High|Moderate|Low|Likely Legitimate",
  "scamType": "Brief description of the scam type",
  "confidence": "High|Medium|Low",
  "primaryIndicators": [
    {
      "issue": "Brief issue description",
      "severity": "Critical|High|Medium|Low",
      "explanation": "Why this matters"
    }
  ],
  "senderAnalysis": {
    "emailAddress": "Extracted email address",
    "domainIssues": ["List of domain-related problems"],
    "verdict": "Assessment of sender legitimacy"
  },
  "contentAnalysis": {
    "urgencyTactics": ["List of urgency tactics used"],
    "genericElements": ["List of generic or suspicious elements"],
    "requestsForInfo": ["List of information or money requests"]
  },
  "recommendedAction": "Specific action recommendation",
  "explanation": "Brief connecting analysis"
}

Email to analyze:
${emailText}`
          }]
        })
      });

      const data = await response.json();
      const textContent = data.content.find(item => item.type === 'text')?.text || '';
      
      // Extract JSON from response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);
        setAnalysis(analysisData);
      } else {
        throw new Error('Could not parse analysis response');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysis({
        riskLevel: 'Unknown',
        scamType: 'Analysis Error',
        confidence: 'Low',
        primaryIndicators: [{
          issue: 'Analysis failed',
          severity: 'High',
          explanation: 'Could not complete analysis. Please try again.'
        }],
        senderAnalysis: { verdict: 'Unknown' },
        contentAnalysis: {},
        recommendedAction: 'Manual review required',
        explanation: 'Technical error occurred during analysis.'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (level) => {
    const colors = {
      'Critical': 'bg-red-600',
      'High': 'bg-orange-500',
      'Moderate': 'bg-yellow-500',
      'Low': 'bg-blue-500',
      'Likely Legitimate': 'bg-green-500',
      'Unknown': 'bg-gray-500'
    };
    return colors[level] || colors['Unknown'];
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': 'text-red-600 bg-red-50 border-red-200',
      'High': 'text-orange-600 bg-orange-50 border-orange-200',
      'Medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'Low': 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[severity] || colors['Medium'];
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Shield className="w-10 h-10 text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-800">Spam Detector Pro</h1>
          </div>
          <p className="text-gray-600 text-lg">Advanced email fraud and phishing analysis</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
          <label className="block text-gray-700 font-semibold mb-3 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Paste suspicious email content
          </label>
          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="Paste the email text here, including sender information, subject line, and body..."
            className="w-full h-48 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg p-4 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none font-mono text-sm"
          />
          
          <button
            onClick={analyzeEmail}
            disabled={analyzing || !emailText.trim()}
            className="mt-4 w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            {analyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                Analyze Email
              </>
            )}
          </button>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-4">
            {/* Risk Level Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Threat Assessment
                </h2>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-white font-bold text-sm ${getRiskColor(analysis.riskLevel)}`}>
                    {analysis.riskLevel}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {analysis.confidence} Confidence
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 text-lg mb-2">
                  <span className="font-semibold text-orange-500">Scam Type:</span> {analysis.scamType}
                </p>
                <p className="text-gray-600">{analysis.explanation}</p>
              </div>
            </div>

            {/* Primary Indicators */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Red Flags Detected
              </h3>
              <div className="space-y-3">
                {analysis.primaryIndicators.map((indicator, idx) => (
                  <div 
                    key={idx} 
                    className={`border rounded-lg p-4 ${getSeverityColor(indicator.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        indicator.severity === 'Critical' ? 'bg-red-600 text-white' :
                        indicator.severity === 'High' ? 'bg-orange-600 text-white' :
                        indicator.severity === 'Medium' ? 'bg-yellow-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {indicator.severity}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold mb-1">{indicator.issue}</p>
                        <p className="text-sm opacity-90">{indicator.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sender Analysis */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('sender')}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-500" />
                  Sender Analysis
                </h3>
                {expandedSections.sender ? 
                  <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                }
              </button>
              
              {expandedSections.sender && (
                <div className="px-6 pb-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                    {analysis.senderAnalysis.emailAddress && (
                      <div>
                        <span className="text-gray-600 text-sm">Email Address:</span>
                        <p className="text-gray-800 font-mono">{analysis.senderAnalysis.emailAddress}</p>
                      </div>
                    )}
                    
                    {analysis.senderAnalysis.domainIssues && analysis.senderAnalysis.domainIssues.length > 0 && (
                      <div>
                        <span className="text-gray-600 text-sm">Domain Issues:</span>
                        <ul className="text-gray-800 list-disc list-inside mt-1">
                          {analysis.senderAnalysis.domainIssues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-gray-600 text-sm">Verdict:</span>
                      <p className="text-gray-800">{analysis.senderAnalysis.verdict}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content Analysis */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('content')}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Content Analysis
                </h3>
                {expandedSections.content ? 
                  <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                }
              </button>
              
              {expandedSections.content && (
                <div className="px-6 pb-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
                    {analysis.contentAnalysis.urgencyTactics && analysis.contentAnalysis.urgencyTactics.length > 0 && (
                      <div>
                        <span className="text-orange-500 text-sm font-semibold">⚡ Urgency Tactics:</span>
                        <ul className="text-gray-800 list-disc list-inside mt-1">
                          {analysis.contentAnalysis.urgencyTactics.map((tactic, idx) => (
                            <li key={idx}>{tactic}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {analysis.contentAnalysis.genericElements && analysis.contentAnalysis.genericElements.length > 0 && (
                      <div>
                        <span className="text-yellow-600 text-sm font-semibold">🚩 Generic Elements:</span>
                        <ul className="text-gray-800 list-disc list-inside mt-1">
                          {analysis.contentAnalysis.genericElements.map((element, idx) => (
                            <li key={idx}>{element}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {analysis.contentAnalysis.requestsForInfo && analysis.contentAnalysis.requestsForInfo.length > 0 && (
                      <div>
                        <span className="text-red-500 text-sm font-semibold">💰 Suspicious Requests:</span>
                        <ul className="text-gray-800 list-disc list-inside mt-1">
                          {analysis.contentAnalysis.requestsForInfo.map((request, idx) => (
                            <li key={idx}>{request}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg border border-orange-600 overflow-hidden">
              <button
                onClick={() => toggleSection('recommendations')}
                className="w-full p-6 flex items-center justify-between hover:opacity-90 transition-opacity"
              >
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Recommended Action
                </h3>
                {expandedSections.recommendations ? 
                  <ChevronUp className="w-5 h-5 text-white" /> : 
                  <ChevronDown className="w-5 h-5 text-white" />
                }
              </button>
              
              {expandedSections.recommendations && (
                <div className="px-6 pb-6">
                  <div className="bg-white bg-opacity-90 rounded-lg p-4 border border-orange-300">
                    <p className="text-gray-800 text-lg font-semibold">{analysis.recommendedAction}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Powered by Claude AI • Advanced pattern recognition and threat analysis</p>
        </div>
      </div>
    </div>
  );
};

export default SpamAnalyzer;
