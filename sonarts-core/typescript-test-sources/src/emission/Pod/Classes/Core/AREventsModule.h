#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

// Invoked on the main thread.
typedef void(^AREventOccurredBlock)(UIViewController * _Nonnull fromViewController, NSDictionary * _Nonnull info);

@interface AREventsModule : NSObject <RCTBridgeModule>
@property (nonatomic, copy, nullable, readwrite) AREventOccurredBlock eventOccurred;
@end