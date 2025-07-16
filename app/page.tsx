import PeriodCheckbox from "@/components/PeriodCheckbox";
import { Button } from "@heroui/button";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center">
      <div className="flex items-center justify-center gap-5 py-10">
        <PeriodCheckbox period="am" />
        <PeriodCheckbox period="pm" />
      </div>
      <Button color="primary" size="lg" radius="lg">
        GO
      </Button>
    </section>
  );
}
