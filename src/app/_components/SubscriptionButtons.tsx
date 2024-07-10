import Button from "./Button";

export default function SubscriptionButtons() {
  return (
    <div className="flex flex-col gap-2">
      <Button>Monthly</Button>
      <Button>Yearly</Button>
    </div>
  );
}
