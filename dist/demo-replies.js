// Deterministic example replies for the website preview. No AI or network request.
export function exampleReply(question) {
  const text=String(question).toLowerCase();
  if(/\b(bottle|plastic|recycl)/.test(text))return {
    title:'Usually, yes.',
    text:'If your local collection accepts it:\n• Empty the bottle.\n• Rinse off residue.\n• Let it dry.\nFollow your barangay’s posted guidance.',
  };
  if(/\b(banana|peel|food|organic|biodegrad)/.test(text))return {
    title:'A little separation helps.',
    text:'Keep food scraps and peels separate from packaging. Check your barangay’s collection notes for biodegradable waste.',
  };
  if(/\b(schedule|collection|pickup|pick.up|when)/.test(text))return {
    title:'Know what’s next.',
    text:'Open Home, then View Full Schedule. Choose an outcome to explore the example collection. Current collection dates are posted in the Android app.',
  };
  if(/\b(report|dump|overflow|concern)/.test(text))return {
    title:'Give it a little context.',
    text:'Open Reports, choose the concern, and add a description, photo, and location. You can review your details before finishing the example.',
  };
  return {
    title:'Let’s try an example.',
    text:'This preview has sample replies for plastic bottles, banana peels, collection schedules, and reporting. Try one of those topics, or open the Android app for its full Assist experience.',
  };
}
