import WidgetKit
import SwiftUI

// Swift Codable representation of MarketTicker
struct TickerItem: Codable, Identifiable {
    var id: String { symbol }
    let symbol: String
    let exchange: String
    let price: Double
    let change: Double
    let changePercent: Double
}

// Read market data from Shared App Group UserDefaults
func getCachedMarketData() -> [TickerItem] {
    guard let defaults = UserDefaults(suiteName: "group.com.alsaifanalysis.com"),
          let dataStr = defaults.string(forKey: "elsaif_widget_market_data"),
          let data = dataStr.data(using: .utf8) else {
        // Fallback default tickers if App Group storage is not yet initialized
        return [
            TickerItem(symbol: "EMAAR", exchange: "DFM", price: 8.42, change: 0.12, changePercent: 1.45),
            TickerItem(symbol: "FAB", exchange: "ADX", price: 13.15, change: -0.05, changePercent: -0.38),
            TickerItem(symbol: "DEWA", exchange: "DFM", price: 2.45, change: 0.02, changePercent: 0.82)
        ]
    }
    do {
        return try JSONDecoder().decode([TickerItem].self, from: data)
    } catch {
        print("Failed to decode widget market data: \(error)")
        return []
    }
}

struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), tickers: getCachedMarketData(), configuration: ConfigurationAppIntent())
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        SimpleEntry(date: Date(), tickers: getCachedMarketData(), configuration: configuration)
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        let entry = SimpleEntry(date: Date(), tickers: getCachedMarketData(), configuration: configuration)
        // Refresh every 15 minutes to save battery
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        return Timeline(entries: [entry], policy: .after(nextUpdate))
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let tickers: [TickerItem]
    let configuration: ConfigurationAppIntent
}

struct widgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            // Header
            HStack {
                Text("Alsaif Market")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(Color(red: 67/255, green: 135/255, blue: 48/255))
                Spacer()
                Image(systemName: "line.diagonal.trend.up")
                    .foregroundColor(Color(red: 67/255, green: 135/255, blue: 48/255))
                    .font(.system(size: 10))
            }
            .padding(.bottom, 2)
            
            Divider()

            // List of stock rows
            ForEach(entry.tickers.prefix(family == .systemMedium ? 3 : 2)) { ticker in
                HStack {
                    VStack(alignment: .leading, spacing: 1) {
                        Text(ticker.symbol)
                            .font(.system(size: 12, weight: .bold))
                        Text(ticker.exchange)
                            .font(.system(size: 8))
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 1) {
                        Text(String(format: "%.2f", ticker.price))
                            .font(.system(size: 12, weight: .semibold))
                        
                        Text(String(format: "%+.2f%%", ticker.changePercent))
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(ticker.changePercent >= 0 ? .green : .red)
                    }
                }
                .padding(.vertical, 1)
                Divider()
            }
            Spacer()
        }
        .padding(10)
    }
}

struct widget: Widget {
    let kind: String = "widget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            widgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
    }
}

#Preview(as: .systemSmall) {
    widget()
} timeline: {
    SimpleEntry(date: .now, tickers: getCachedMarketData(), configuration: ConfigurationAppIntent())
}
