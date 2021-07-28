import { BeamModal } from './tests/beamModal'
import { BeamStaticDiagram1 } from './tests/beamStaticDiagram1'
import { BeamStaticDiagram2 } from './tests/beamStaticDiagram2'
import { BeamStaticDiagram3 } from './tests/beamStaticDiagram3'
import { BridgeDynamic } from './tests/bridgeDynamic'
import { BridgeModal } from './tests/bridgeModal'
import { BridgeStatic } from './tests/bridgeStatic'
import { FallingBeam } from './tests/fallingBeam'
import { FlatPlate } from './tests/flatPlate'
import { FlatPlateHole } from './tests/flatPlateHole'
import { TrussAxialImpact } from './tests/trussAxialImpact'

const showPlots = true
TrussAxialImpact(showPlots)
FallingBeam(showPlots)
BeamModal(showPlots)
BridgeModal(showPlots)
BridgeStatic(showPlots)
BridgeDynamic(showPlots)
BeamStaticDiagram1(showPlots)
BeamStaticDiagram2(showPlots)
BeamStaticDiagram3(showPlots)
FlatPlate()
FlatPlateHole()
