// AI Repair Assistant Diagnostic Service
// Supports Google Gemini API (if GEMINI_API_KEY configured) and a comprehensive built-in diagnostic expert engine.

const DIAGNOSTIC_PATTERNS = [
  {
    keywords: ['screen', 'display', 'flicker', 'cracked', 'glass', 'touch', 'black screen', 'lines on screen'],
    devices: ['Mobile Repair', 'Laptop Repair', 'TV Repair'],
    diagnose: (text) => {
      const isTV = /tv|television|panel/i.test(text);
      const isLaptop = /laptop|macbook|dell|thinkpad|hp/i.test(text);
      if (isTV) {
        return {
          category: 'TV Repair',
          possibleIssue: 'LED Backlight Array Degradation or T-Con Board Timing Failure',
          suggestedNextStep: 'Do not press the panel. Check if audio is playing when screen is dark (flashlight test). Avoid DIY disassembly as high voltages reside on the power board.',
          estimatedCostRange: '₹2,500 - ₹5,500',
          professionalInspectionRecommended: true,
          preventativeTip: 'Keep back vents clear of dust and operate the TV with a surge protector.'
        };
      }
      if (isLaptop) {
        return {
          category: 'Laptop Repair',
          possibleIssue: 'Damaged Display Matrix, Loose eDP Ribbon Cable, or GPU Signal Desynchronization',
          suggestedNextStep: 'Connect an external HDMI monitor to verify if the GPU output is intact. If external screen works, display assembly or cable needs replacement.',
          estimatedCostRange: '₹3,800 - ₹9,500',
          professionalInspectionRecommended: true,
          preventativeTip: 'Always open the laptop lid from the center rather than one corner to avoid hinge torque on the screen.'
        };
      }
      return {
        category: 'Mobile Repair',
        possibleIssue: 'OLED/LCD Digitizer Fracture or Touch IC Controller Disconnection',
        suggestedNextStep: 'Backup your data immediately via cloud or PC sync if touch is partly working. Place phone in a protective case to prevent glass splinter injury.',
        estimatedCostRange: '₹2,200 - ₹6,500',
        professionalInspectionRecommended: true,
        preventativeTip: 'Apply a 9H tempered glass screen guard and a shock-absorbing bumper case.'
      };
    }
  },
  {
    keywords: ['battery', 'drain', 'charge', 'charging', 'dead', 'swollen', 'power off', 'overheat'],
    devices: ['Mobile Repair', 'Laptop Repair'],
    diagnose: (text) => {
      const isLaptop = /laptop|macbook|notebook/i.test(text);
      if (isLaptop) {
        return {
          category: 'Laptop Repair',
          possibleIssue: 'Lithium Battery Cell Degradation (>500 charge cycles) or DC-In Jack / PMIC Fault',
          suggestedNextStep: 'Check Windows Battery Report (powercfg /batteryreport) or macOS System Info cycle count. If battery is bulging, cease charging immediately.',
          estimatedCostRange: '₹2,800 - ₹5,200',
          professionalInspectionRecommended: true,
          preventativeTip: 'Avoid keeping the charger plugged continuously at 100% in high heat conditions.'
        };
      }
      return {
        category: 'Mobile Repair',
        possibleIssue: 'Battery Capacity Wear or Sub-board Charging Port Oxidation',
        suggestedNextStep: 'Inspect the lightning/USB-C charging port for pocket lint using a non-metallic toothpick. Check Battery Health in Settings (<80% requires replacement).',
        estimatedCostRange: '₹1,200 - ₹2,800',
        professionalInspectionRecommended: true,
        preventativeTip: 'Use OEM or MFi-certified charging adapters and cables to safeguard the charging IC.'
      };
    }
  },
  {
    keywords: ['cooling', 'cool', 'not cold', 'hot air', 'water dripping', 'leak', 'ice', 'gas', 'compressor', 'noise', 'buzzing'],
    devices: ['AC Repair', 'Refrigerator Repair'],
    diagnose: (text) => {
      const isFridge = /fridge|refrigerator|freezer/i.test(text);
      if (isFridge) {
        return {
          category: 'Refrigerator Repair',
          possibleIssue: 'Defrost Heater Failure, Blocked Condenser Coils, or Starter Relay Malfunction',
          suggestedNextStep: 'Vacuum dust from rear condenser coils. Listen to rear bottom for clicking noises indicating a faulty PTC starter relay. Keep door seals clean.',
          estimatedCostRange: '₹2,400 - ₹5,800',
          professionalInspectionRecommended: true,
          preventativeTip: 'Ensure at least 3 inches of clearance behind the refrigerator for optimal airflow.'
        };
      }
      return {
        category: 'AC Repair',
        possibleIssue: 'Refrigerant (R32/R410A) Low Pressure, Clogged Blower Filter, or Run Capacitor Deterioration',
        suggestedNextStep: 'Switch off the unit if outdoor unit emits humming without spinning. Clean the nylon air filters. Do not attempt refrigerant handling without certified gauges.',
        estimatedCostRange: '₹1,800 - ₹4,800',
        professionalInspectionRecommended: true,
        preventativeTip: 'Clean indoor air filters every 3 weeks during peak summer season.'
      };
    }
  },
  {
    keywords: ['spin', 'drum', 'washing', 'vibration', 'water not draining', 'drain', 'overflow', 'door locked', 'error code'],
    devices: ['Washing Machine Repair'],
    diagnose: () => ({
      category: 'Washing Machine Repair',
      possibleIssue: 'Drain Pump Filter Obstruction, Spider Arm/Drum Bearing Wear, or Drive Belt Slack',
      suggestedNextStep: 'Unscrew the bottom drain filter catch to clear coins or debris. Check if load is evenly distributed. Do not force open electronic door locks.',
      estimatedCostRange: '₹1,900 - ₹4,600',
      professionalInspectionRecommended: true,
      preventativeTip: 'Run a tub-clean cycle with descaling solution monthly to prevent mineral buildup.'
    })
  },
  {
    keywords: ['slow', 'virus', 'fan', 'loud', 'blue screen', 'bsod', 'reboot', 'storage', 'ram', 'windows'],
    devices: ['Computer Repair', 'Laptop Repair'],
    diagnose: (text) => ({
      category: 'Computer Repair',
      possibleIssue: 'Thermal Paste Dryout, Thermal Throttling, or Corrupted Operating System / HDD Sector Failure',
      suggestedNextStep: 'Check CPU temperature with HWMonitor. Test in Safe Mode to isolate background driver conflict. Backup critical documents immediately.',
      estimatedCostRange: '₹1,500 - ₹4,200',
      professionalInspectionRecommended: false,
      preventativeTip: 'Clean CPU cooler heatsinks and upgrade mechanical hard drives to NVMe/SATA SSDs.'
    })
  }
];

export async function analyzeProblemWithAI(problemText, categoryHint = '') {
  const text = (problemText || '').trim();
  if (!text) {
    throw new Error('Problem description is required for diagnosis.');
  }

  // 1. Check if Gemini API Key is configured and available
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== '') {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert electronics and appliance repair diagnostic system for RepairHub platform.
Customer problem: "${text}"
Preferred category hint: "${categoryHint || 'None'}"

Respond ONLY with valid JSON in this exact structure:
{
  "category": "One of: Mobile Repair, Laptop Repair, Computer Repair, TV Repair, AC Repair, Refrigerator Repair, Washing Machine Repair, Other",
  "possibleIssue": "Precise technical diagnosis under 20 words",
  "suggestedNextStep": "Immediate safety advice and troubleshooting tip under 30 words",
  "estimatedCostRange": "₹XXXX - ₹YYYY",
  "professionalInspectionRecommended": true or false,
  "confidence": "High" or "Medium",
  "preventativeTip": "Maintenance advice under 25 words"
}`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawContent) {
          const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
              ...parsed,
              engine: 'Gemini AI Assistant'
            };
          }
        }
      }
    } catch (err) {
      console.warn('[AI Service] Gemini API call failed, falling back to expert diagnostic engine:', err.message);
    }
  }

  // 2. High-precision rule & keyword expert diagnostic engine
  const lowerText = text.toLowerCase();
  for (const pattern of DIAGNOSTIC_PATTERNS) {
    if (pattern.keywords.some(kw => lowerText.includes(kw))) {
      const diagnosis = pattern.diagnose(lowerText);
      return {
        ...diagnosis,
        confidence: 'High',
        engine: 'RepairHub Expert Diagnostic Engine'
      };
    }
  }

  // Fallback for general or unspecified issues
  const detectedCategory = categoryHint || 'Other';
  return {
    category: detectedCategory,
    possibleIssue: 'Component Degradation or Intermittent Electrical Connection',
    suggestedNextStep: 'Safely disconnect power and document symptoms. A certified repair technician should perform multimeter voltage testing.',
    estimatedCostRange: '₹1,500 - ₹3,800',
    professionalInspectionRecommended: true,
    confidence: 'Medium',
    preventativeTip: 'Avoid powering up equipment when experiencing erratic electrical behavior.',
    engine: 'RepairHub Expert Diagnostic Engine'
  };
}
