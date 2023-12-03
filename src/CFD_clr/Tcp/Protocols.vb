Public Enum Protocols

    ''' <summary>
    ''' setup the CFD session
    ''' </summary>
    Setup
    Reset

    ''' <summary>
    ''' start or resume
    ''' </summary>
    Start
    Pause
    [Stop]

    SetBarrier
    MoveTracers

    ''' <summary>
    ''' request a frame data
    ''' </summary>
    RequestFrame
End Enum
