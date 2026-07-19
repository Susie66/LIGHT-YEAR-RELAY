import type { AcademyQuestion } from "./academy";

export const academyModulesEnglish = [
  {name:"Solar System & Planets",icon:"🪐",start:1,end:50},
  {name:"Life in Space",icon:"👩‍🚀",start:51,end:100},
  {name:"Spacecraft Systems",icon:"🚀",start:101,end:150},
  {name:"Deep-Space Communications",icon:"📡",start:151,end:200},
  {name:"Scientific Thinking",icon:"🔭",start:201,end:250},
  {name:"Mission Decisions",icon:"🧭",start:251,end:300},
];

const banks = [
  [
    ["What is Jupiter's most visible atmospheric feature?","Long-lived storms and banded clouds","A global liquid ocean","A solid iron surface","No moons","Jupiter is a gas giant; the Great Red Spot is a vast, long-lived storm."],
    ["Why do planets remain in orbit around the Sun?","Gravity and orbital inertia act together","Solar wind pushes them","Other planets tow them","Sunlight forms a rail","Gravity bends forward motion into an orbit."],
    ["Why does Mars look red?","Iron minerals in its soil are oxidized","Its surface is molten","Its air is red","It reflects Jupiter","Iron oxides give Martian soil its rusty color."],
    ["Where is the main asteroid belt?","Between Mars and Jupiter","Between Earth and Mars","Beyond Neptune only","Inside Mercury's orbit","Most main-belt asteroids orbit between Mars and Jupiter."],
    ["What does one astronomical unit describe?","Earth's average distance from the Sun","Earth to Moon distance","One light-year","The Sun's diameter","One AU is about 150 million kilometres."],
  ],
  [
    ["Why must astronauts exercise every day?","To reduce muscle and bone loss","To power the spacecraft","To create gravity","To cool oxygen","Regular resistance and aerobic exercise limit microgravity deconditioning."],
    ["How is water normally consumed in microgravity?","From a sealed drink pouch","From an open glass","From a cabin tap","As floating droplets","Sealed containers keep water away from eyes and equipment."],
    ["Why are sleeping bags secured?","To prevent drifting into equipment or vents","To increase gravity","To improve radio range","To warm the hull","Securing the sleeper maintains position and airflow."],
    ["Why is cabin ventilation continuous?","Exhaled CO₂ can collect around a face","To move the spacecraft","To create sound","To raise pressure","Forced airflow prevents local carbon-dioxide pockets."],
    ["What best supports mental health on a long mission?","Routine, rest, honest reporting, and contact","Hiding every emotion","Working continuously","Ending family contact","Social support and early help reduce isolation risk."],
  ],
  [
    ["Oxygen falls while cabin pressure stays stable. What should Control do first?","Cross-check a backup sensor","Start an EVA","Remove every filter","Disable communications","Conflicting readings should be independently verified before risky repair."],
    ["Why does a spacecraft carry backup power?","To preserve critical systems after a failure","To brighten decoration","To replace oxygen","To shorten distance","Redundancy prevents one fault from ending life support, navigation, or communications."],
    ["What is the immediate danger of a hull crack?","Loss of pressure and atmosphere","Slower networking","Food spoilage only","Clock drift","A crack can leak cabin gas and must be located and isolated."],
    ["Why isolate a failed module?","To stop the fault spreading","To make it repair itself","To increase gravity","To create fuel","Isolation limits electrical, air, thermal, or data failures."],
    ["Why calibrate sensors?","To compare readings with a known standard","To strengthen the hull","To increase storage","To shorten the mission","Calibration detects drift before control decisions use bad data."],
  ],
  [
    ["What does an 18-minute one-way delay mean?","An Earth command arrives at least 18 minutes later","Conversation is instant","A round trip takes 18 seconds","Packets cannot be lost","Distance turns conversation into delayed exchanges."],
    ["What should limited bandwidth prioritize?","Critical telemetry and safety directives","Entertainment video","Blank packets","Equal shares for all files","Survival and decision-critical data come first."],
    ["What is the main benefit of compression?","It sends content with fewer bits","It increases light speed","It removes every error","It strengthens hardware","Compression saves bandwidth; lossy methods may reduce quality."],
    ["How can packet loss be handled?","Retransmission or error-correction codes","Disable the receiver","Guess the missing text","Change spacecraft mass","Protocols can resend or reconstruct damaged data."],
    ["Why must delayed emergency orders include conditions?","The situation may change before arrival","Signals change language","Crew cannot read short text","Earth time stops","Conditional authority lets the crew respond safely to newer local data."],
  ],
  [
    ["Two sensors disagree. What is the strongest scientific response?","Check calibration and seek independent evidence","Trust the newer sensor only","Choose the preferred result","Average them blindly","Replication and independent evidence help locate error."],
    ["What is a testable explanation called?","A hypothesis","An ending","A command","A preference","A scientific hypothesis produces observable predictions."],
    ["Why preserve raw data?","So analysis can be audited and repeated","It automatically becomes a conclusion","It replaces methods","It reduces travel time","Raw records make processing verifiable."],
    ["Does correlation always prove causation?","No; other factors may explain it","Yes, always","Only in space","Matching numbers prove it","Co-variation alone does not establish cause."],
    ["An unknown signal appears once. What is the cautious next step?","Repeat observation and exclude interference","Announce alien life","Delete it","Immediately chase it","Extraordinary conclusions need repeatable independent evidence."],
  ],
  [
    ["Oxygen loss and science upload occur together. What comes first?","Verify life-support safety","Finish every image upload","Organize family photos","Change the mission badge","Human survival outranks recoverable mission data."],
    ["Time is short and evidence incomplete. What makes a good decision?","A low-risk reversible action with a review point","Pretending certainty","The most exciting option","No preparation","Reversible steps preserve options while new evidence arrives."],
    ["How should a highly fatigued crew member's directive change?","Reduce complexity and avoid high-load work","Add simultaneous tasks","Demand more speed","Ignore fatigue","Fatigue reduces attention and judgment."],
    ["A family photo includes classified hardware. What is balanced?","Crop or blur only the sensitive area","Publish the raw image","Ban all family contact","Delete every message","Minimum necessary editing protects both security and connection."],
    ["Why reserve a safety margin when allocating resources?","To absorb failures, delay, and estimation error","To make numbers tidy","To avoid using resources","To improve entertainment","Deep-space missions cannot rely on rapid resupply."],
  ],
] as const;

const styles = ["QUICK CHECK","MISSION SCENARIO","DATA INTERPRETATION","CREW DISCUSSION","PRIORITY REVIEW"];
export const academyQuestionsEnglish: AcademyQuestion[] = Array.from({length:300},(_,index)=>{
  const moduleIndex=Math.floor(index/50);
  const fact=banks[moduleIndex][index%5];
  const cycle=Math.floor((index%50)/5);
  return {id:index+1,category:academyModulesEnglish[moduleIndex].name,icon:academyModulesEnglish[moduleIndex].icon,type:"單選題",prompt:`${styles[cycle%styles.length]} ${cycle+1}: ${fact[0]}`,options:[fact[1],fact[2],fact[3],fact[4]],answer:0,explanation:fact[5]};
});
