import CornerRect from "../util/CornerRect";
import tr from '@/assets/ui/corners/d1/tr.png'
import br from '@/assets/ui/corners/d1/br.png'
import pissbot from '@/assets/ui/corners/special/pissbot.png'

export default function EventLog() {
    return (
      <CornerRect borderSize={3} borderType="double white" corners={[pissbot, tr, undefined, br]} style={{width: 'inherit', height: 'inherit'}}>
        cum
      </CornerRect>
    )
}